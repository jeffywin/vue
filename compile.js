/**
 * 编译模板
 */

class Compile {
    constructor(el,vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el); //#app
        this.vm = vm; //整个vue实例，包含$el: #app 和 $data

        if(this.el) {
            //1.把真实dom移入到文档碎片中
            let fragment = this.nodeToFragment(this.el)

            //2. 编译 提取想要的元素节点 v-model 和 {{}}
            this.compile(fragment)

            //3.把编译好的文档碎片塞到页面
            this.el.appendChild(fragment)  
        }
    }

    /* 辅助方法 */
    isElementNode(node) {
        return node.nodeType === 1 //Element type === 1
    }
    //判断是不是指令v-开头
    isDirective(node) {
      return node.includes('v-')
    }


    /* 核心方法 */

    //把真实dom节点转为文档碎片
    nodeToFragment(el) {
      //文档碎片
      let fragment = document.createDocumentFragment()
      let firstChild;
      while(firstChild = el.firstChild){
        fragment.appendChild(firstChild)
      }
      return fragment
    }

    //编译 文档节点，处理 v-model 和 {{}}
    compile(fragment) {
      let childNodes = fragment.childNodes
      Array.from(childNodes).forEach(node => {
        if(this.isElementNode(node)) {
          //元素节点,元素节点可能嵌套，所以继续递归调用
          this.compile(node)
          //console.log('元素', node)
          //编译元素节点
          this.compileElementNode(node)
        }else {
          //编译文本节点
          this.compileTextNode(node)
          //console.log('文本', node)
        }
      })
    }
    //编译元素节点
    compileElementNode(node) {
      //v-model
      let attrs = node.attributes
      Array.from(attrs).filter(v=>{
        //判断属性名字是不是包含v-
        let name = v.name //key v.name value v.value v-model='message' name:v-model elementValue: message
        if(this.isDirective(name)) {
          //取对应的值放对应的节点中
          //node:节点(当前输入框)  数据:this.vm.$data nodeText:编译出来的文本
          let elementValue = v.value; //元素值 message
          let type = name.slice(2); //model
          CompileUtil[type](node,this.vm.$data,elementValue)
        }
      })
    }

    //编译文本节点
    compileTextNode(node) {
      //{{abc}}
      let nodeText = node.textContent //文本中内容 message
      let reg = /\{\{([^}]+)\}\}/g //^} 中间不能再有 }
      if(reg.test(nodeText)) {
        //node:节点(比如当前{{message}})  数据:this.vm.$data nodeText:编译出来的文本
        CompileUtil['text'](node,this.vm.$data,nodeText)
      }
    }
}

//工具方法
CompileUtil = {
  getVal(data,value) {//获取vm.data实例上对应的数据
    value = value.split('.') //["message", "a", "b"] data中的key 想要获取message.a的值可以用reduce 收敛
    return value.reduce((prev,next) => {
      return prev[next];
    }, data) //这时的data作为第一项 prev[next] = data[a] => data[a]作为第一项 收敛下去 data[a][b]
  },
  getText(data,value) {
    return value.replace(/\{\{([^}]+)\}\}/g,(...arguments) => { //arguments : ["{{a.b}}", "a.b", 0, "{{a.b}}"]    
      return this.getVal(data, arguments[1])    
    })
  },
  //文本处理  node:节点(输入框)  data:this.vm.$data value:{{message}}
  text(node,data,value) {//这里的value可能是{{message}}{{a.b}}等 多个，所以不能单独传
    let updateFn = this.update['textUpdate'] //value : {{a.b}} {{message.name}}
    let val = this.getText(data, value)
    value.replace(/\{\{([^}]+)\}\}/g,(...arguments) => { //arguments : ["{{a.b}}", "a.b", 0, "{{a.b}}"]
      new Watcher(data, arguments[1],(newVal)=>{//new Watch时，Dep.target才有值
        updateFn && updateFn(node, this.getText(data,value))
      })
    })
    updateFn && updateFn(node, val)
  },
  //输入框处理  node:节点(输入框)  data:this.vm.$data value:编译出来的文本
  model(node,data,value) {
    let updateFn = this.update['modelUpdate']
    new Watcher(data, value,(newVal) =>{ //value: v-model 或者 {{}} 中的值
      //当值变化后，才会调用callback，将新值传过去
      updateFn && updateFn(node, this.getVal(data, value))//输入框更新方法
    })
    updateFn && updateFn(node, this.getVal(data, value))//输入框更新方法
  },
  //公共方法
  update: {//文本更新
    textUpdate(node, value) {
      node.textContent = value
    },//输入框更新
    modelUpdate(node, val) {
      node.value = val
    }
  }

}
