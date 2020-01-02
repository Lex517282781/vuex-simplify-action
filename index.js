const Request = 'Request';
const Success = 'Success';
const Failure = 'Failure';

function _getStateDynamic(stateNames) {
  const nextData = stateNames.reduce((collect, current) => {
    const type = Object.prototype.toString.call(current);
    switch (type) {
      case '[object Number]':
      case '[object String]':
        return {
          ...collect,
          [`${current}`]: {
            loading: false,
            data: null
          }
        };
      case '[object Object]':
        return {
          ...collect,
          [current.name]: {
            loading: false,
            data: current.data
          }
        };
      case '[object Array]':
        return {
          ...collect,
          [current[0]]: {
            loading: false,
            data: current[1]
          }
        };
      default:
        console.warn(
          'illegal args, expect args type of number or string or object or array'
        );
        return collect;
    }
  }, {});
  return nextData;
}

/**
 * 强化 stateNames
 * @param {Array} stateNames
 * stateNames 如: ['foo', 'bar'] 或者 [{name: 'foo', data: null}, { name: 'bar', data: [] }] 或者 [['bar', null], ['foo', []]]
 */
export function stateEnhance(stateNames, ...rest) {
  if (!Array.isArray(stateNames)) stateNames = [stateNames, ...rest];
  stateNames = [...stateNames, ...rest];
  return function(target, name, description) {
    const preFn = description.initializer;
    description.initializer = function() {
      const preData = preFn();
      const nextData = _getStateDynamic(stateNames);
      return {
        ...preData,
        ...nextData
      };
    };
  };
}

function _getMutationsDynamic(stateNames) {
  const newData = stateNames.reduce((collect, current) => {
    const type = Object.prototype.toString.call(current);
    switch (type) {
      case '[object Number]':
      case '[object String]':
        return {
          ...collect,
          [`${current}${Request}`](state) {
            state[`${current}`].loading = true;
          },
          [`${current}${Success}`](state, data) {
            state[`${current}`].loading = false;
            state[`${current}`].data = data;
          },
          [`${current}${Failure}`](state) {
            state[`${current}`].loading = false;
          }
        };
      default:
        console.warn('illegal args, expect args type of number or string');
        return collect;
    }
  }, {});
  return newData;
}

/**
 * 强化 mutations
 * @param {Array} stateNames
 * stateNames 如: ['foo', 'bar']
 */
export function mutationsEnhance(stateNames, ...rest) {
  if (!Array.isArray(stateNames)) stateNames = [stateNames, ...rest];
  stateNames = [...stateNames, ...rest];
  return function(target, name, description) {
    const preFn = description.initializer;
    description.initializer = function() {
      const preData = preFn();
      const newData = _getMutationsDynamic(stateNames);
      return {
        ...preData,
        ...newData
      };
    };
  };
}

// 单个强化action
export function actionEnhance(stateName, state, mutations, auto = true) {
  return function(target, name, description) {
    const preFn = description.value;
    if (auto) {
      const stateNames = [stateName];
      if (state) Object.assign(state, _getStateDynamic(stateNames));
      if (mutations) Object.assign(mutations, _getMutationsDynamic(stateNames));
    }
    description.value = async function({ commit, ...rest }) {
      commit(`${stateName}${Request}`);
      const result = await preFn.apply(this, arguments);
      const { res, next } = result;

      if (result.res !== undefined) {
        // 返回的结果假如是再次封装的 那么使用封装之后的参数 否则直接使用result即可
        if (res) {
          commit(`${stateName}${Success}`, res);
          next && next();
        } else {
          commit(`${stateName}${Failure}`);
        }
        return res;
      } else {
        if (result) {
          commit(`${stateName}${Success}`, result);
        } else {
          commit(`${stateName}${Failure}`);
        }
        return result;
      }
    };
  };
}

/**
 * 强化actions
 * @param {Array} stateMaps
 * stateMaps 如: [{name: 'foo', action: 'bar'}]
 */
export default function actionsEnhance(stateMaps, ...rest) {
  const lastParam = rest.slice(-1) || true; // 需要取出最后一个参数 默认为true 即为 actions 自动设 state 和 mutations 值
  const restParam = rest.slice(0, -1);
  if (!Array.isArray(stateMaps)) stateMaps = [stateMaps, ...restParam];
  stateMaps = [...stateMaps, ...restParam];
  return function(target, name, description) {
    const preFn = description.initializer;
    if (lastParam) {
      const stateNames = stateMaps.map(item => item.name);
      target.state = {
        ...target.state,
        ..._getStateDynamic(stateNames)
      };
      target.mutations = {
        ...target.mutations,
        ..._getMutationsDynamic(stateNames)
      };
    }
    description.initializer = function() {
      const preData = preFn();
      const newData = stateMaps.reduce((collect, current) => {
        const type = Object.prototype.toString.call(current);
        const actions = target.actions;
        switch (type) {
          case '[object Object]':
            const { name: stateName, action } = current;
            return {
              ...collect,
              async [action]({ commit, ...rest }) {
                commit(`${stateName}${Request}`);
                const result = await actions[action].apply(this, arguments);
                const { res, next } = result;

                if (result.res !== undefined) {
                  // 返回的结果假如是再次封装的 那么使用封装之后的参数 否则直接使用result即可
                  if (res) {
                    commit(`${stateName}${Success}`, res);
                    next && next();
                  } else {
                    commit(`${stateName}${Failure}`);
                  }
                  return res;
                } else {
                  if (result) {
                    commit(`${stateName}${Success}`, result);
                  } else {
                    commit(`${stateName}${Failure}`);
                  }
                  return result;
                }
              }
            };
          default:
            return collect;
        }
      }, {});
      return {
        ...preData,
        ...newData
      };
    };
  };
}
