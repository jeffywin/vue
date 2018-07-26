/**
 * 观察者 给需要变化的元素增加观察者，当数据变化后，执行方法
 */

 class Watcher {
    constructor(data,value,callback) {
      this.data = data //整个vue实例
      this.value = value //v-model 或者 {{}} 中的值
      this.callback = callback

      //获取老值,通过v-model 或者 {{}}中的内容，在data中拿到对应的值
      this.val = this.get()
    }

    getVal(data,value) {//获取vm.data实例上对应的数据
      let val = value.split('.') //["message", "a", "b"] data中的key 想要获取message.a的值可以用reduce 收敛
      return val.reduce((prev,next) => {
        return prev[next];
      }, data) //这时的data作为第一项 prev[next] = data[a] => data[a]作为第一项 收敛下去 data[a][b]
    }

    get() {
      Dep.target = this;//把当前实例放Dep的target上
      let value = this.getVal(this.data, this.value);//拿到v-model后面或者{{}}中的值
      Dep.target = null;
      return value;
    }

    //对外暴露的方法，当外面值变化时，调用update
    update() {//this.value: v-model 或者 {{}} 中的值
      let newVal = this.getVal(this.data, this.value) 
      let oldVal = this.value
      if(newVal !== oldVal) {
        this.callback(oldVal,newVal)
      }
    }
 }