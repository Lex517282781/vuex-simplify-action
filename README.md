# vuex-simplify-action

方便快捷的vuex action自动生成器

- 示例
  - [vuex-simplify-action-demo](https://github.com/Lex517282781/vuex-simplify-action-demo)
  - 可切换不同的分支查看不同的api的使用详情

- 开始

  - 简介

    `vuex-simplify-action` 是基于 `vuex` 中的`action` 简化生成器

  - 启示

    我们知道异步请求的三个状态, 无论何种前后端框架, 前后端数据管理工具, 在管理应用数据流的时候, 都需要管理三种请求状态, 分别是请求开始的action、请求成功的action、请求失败的action;

     对应的可能你需要每次在`同步action`(vuex对应mutation)中, 创建三种action(如: `requestAction`、`successAction`、`failureAction`) ,  同时可能会创建统一数据格式的数据(如: `{ loading: false, data: {} }`);

    基于此种情况, `vuex-simplify-action` 对 `vuex` 中的 `action` 做了封装和加强, 不需要开发者手动对每个`异步action` 做匹配的数据同步管理, `vuex-simplify-action` 会对 开发者管理的每个`异步action`自动生成统一类型的`同步action`和统一类型的`state`

  - 安装

    `vuex-simplify-action`  是基于 `vuex` 的，所以基本上是在vue和vuex同时使用的项目当中使用

    ```javascript
    npm i vuex-simplify-action -S
    ```



- 使用

  - stateEnhance

    `vuex`  `state` 加强器

    ```javascript
    /* 
    * 在modules中的分store装饰state, 自动生成{ loading: false, data: {} } 的形式 
    * @method stateEnhance
    * @param {String|Array} 参数为字符串|字符串数组|对象数据|数组数组 如: 'foo' 或者 ['foo', 'bar'] 或者 [{name: 'foo', data: null}, { name: 'bar', data: [] }] 或者 [['bar', null], ['foo', []]]
    */
    
    import { stateEnhance } from 'vuex-simplify-action';
    
    const store = {
      namespaced: true,
      @stateEnhance('foo')
      state,
      getters,
      mutations,
      actions
    };
    
    // 经过@stateEnhance('foo')装饰之后, 会在vuex中的state自动生成 state: { foo: { loading: false, data: null } }
    ```
    
  - mutationsEnhance
  
    `vuex`  `mutations` 加强器 一般配合 `stateEnhance` 使用
  
    ```javascript
    /* 
    * 在modules中的分store装饰mutations, 自动生成{ [`stateRequest`]: f => f, `stateSuccess`]: f => f,`stateFailure`]: f => f, } 的形式 
    * @method mutationsEnhance
    * @param {String|Array} 参数为字符串|字符串数组 如: 'foo' 或者 ['foo', 'bar']
    */
    
    import { stateEnhance, mutationsEnhance } from 'vuex-simplify-action';
    
    const store = {
      namespaced: true,
      @stateEnhance('foo')
      state,
      getters,
      @mutationsEnhance('foo')
      mutations,
      actions
    };
    
    // 经过@mutationsEnhance('foo')装饰之后, 会在vuex中的mutations自动生成 mutations: { fooRequest: f => f, fooSuccess: f => f, fooFailure: f => f }
    // 注意点: 使用mutationsEnhance加强之前 首先需要对对应的key的state做强化 或者手动声明state中相应的key值 否则会因为相应的key值没预先声明出现赋值报错: "TypeError: Cannot set property 'loading' of undefined"
    ```
  
  - actionEnhance
  
    `vuex`  `action` 加强器
  
    ```javascript
    /* 
    * 在modules中的分store装饰actions
    * 自动扩展 state 和 mutations 两个对象
    * 单个请求直接返回后端响应的值
    * 一个数据请求依赖另外一个数据请求的时候 如 B请求 依赖 A请求，那么 B请求需要放在next函数里面, 并同A请求的响应一起返回
    * @method mutationsEnhance
    * @param {String, state, mutations} 参数state的key值 后面的state, mutations是必须待扩展的那两个对象 自动扩展的话 需要传这两个字段
    */
    
    import { actionEnhance } from 'vuex-simplify-action';
    
    const actions = {
      @actionEnhance('foo', state, mutations)
      async getfoo() {
        const res = await service.getfoo();
        if (!res) return false;
    
        return res;
      },
      @actionEnhance('baz', state, mutations)
      async getbaz() {
        const res = await service.getbaz();
        if (!res) return false;
    
        return res;
      },
      @actionEnhance('bar', state, mutations)
      async getbar({ dispatch }) {
        const res = await service.getbar();
        if (!res) return false;
    
        const next = function() {
          dispatch('getbaz');
        };
        return {
          res,
          next
        };
      }
    };
    
    // 经过@actionEnhance('foo')装饰之后, 会在vuex中的state自动生成 state: { loading: false, data: null } 在mutations自动生成 mutations: { fooRequest: f => f, fooSuccess: f => f, fooFailure: f => f }
    ```
  
  - actionsEnhance
  
    `vuex`  `action` 批量加强器
  
    `action` 内部的方法使用同 单个action增强器 只是在声明的时候是在action上装饰声明
  
    ```javascript
    import service from '@/service'; // 这是异步请求方法 不一定是这样的
    import actionsEnhance from 'vuex-simplify-action';
    
    const state = {};
    const getters = {};
    const mutations = {};
    const actions = {
      async getfoo() {
        const res = await service.getfoo();
        if (!res) return false;
    
        return res;
      },
      async getbaz() {
        const res = await service.getbaz();
        if (!res) return false;
    
        return res;
      },
      async getbar({ dispatch }) {
        const res = await service.getbar();
        if (!res) return false;
    
        const next = function() {
          dispatch('getbaz');
        };
        return {
          res,
          next
        };
      }
    };
    
    const store = {
      namespaced: true,
      state,
      getters,
      mutations,
      @actionsEnhance([
        { name: 'foo', action: 'getfoo' },
        { name: 'bar', action: 'getbar' },
        { name: 'baz', action: 'getbaz' }
      ])
      actions
    };
    
    export default store;
    
    ```
  
    



- 注意

  vuex-simplify-action 需要配置对于装饰器模式的支持

  具体配置方式 可参考 [vuex-simplify-action-demo](https://github.com/Lex517282781/vuex-simplify-action-demo)

