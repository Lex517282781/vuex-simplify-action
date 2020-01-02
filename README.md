## vuex-simplify-action

    - 统一化
    	数据最好做成统一化
    	同步数据是 `state=data`
    	异步数据是 ``state={ loading: false, data }
    - action强化
    	vuex 中 state getters mutations actions 保持原来的接口不变 只是对各个功能做了加强
    	可在各个store中导入 stateEnhance 文件中的 stateEnhance mutationsEnhance actionEnhance actionsEnhance

    	使用 stateEnhance
    		自动生成 { loading: false, data } 的形式

    	使用 mutationsEnhance
    		自动生成 mutations 请求收据的三种同步更改数据形式

    	使用 actionEnhance
    		可单个对 action 强化

    	使用 actionsEnhance
    		可批量对 action 强化
        
    	一个actionA依赖另外一个actionB的使用场景
    		actionA需要放在actionB内部声明的next函数里面 并返回

    	- 使用
    		actionsEnhance 如
    		```js
    			@actionsEnhance([{
    				name: 'userInfo',
    				action: 'getUserInfo'
    			}, {
    				name: 'topFuncs',
    				action: 'getTopFuncs'
    			}])
    			actions
    		```
    			使用actionsEnhance装饰module中的actions
    			第一个参数为stateMaps对象数组 对象中属性为name 和 action
    			name为state的名称 action为在actions中声明的方法
    			最后一个参数为布尔值 表示是否自动生成对应的state和mutations 默认true自动生成
    			最后一个参数设置为false值 需要手动设置对应的state和mutations值 即手动对对 state mutation 做对应强化

    		stateEnhance 如
    		```js
    			@stateEnhance('foo', 'bar')
    			state
    		```

    		mutationsEnhance 如
    		```js
    			@mutationsEnhance('foo', 'bar')
    			mutations
    		```

    		actionEnhance 如
    		```js
    			// 注意 单个强化版本假如需要自动生成对应的 state 和 mutations, 需要手动传 state 和 mutations 至 actionEnhance 装饰器里面
    			@actionEnhance('foo', state, mutations)
    			foo
    		```
