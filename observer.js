/**
 * 数据劫持 在data的属性上添加get和set方法，数据变化时，调用set
 */

 class Observer {
     constructor(data) {
        this.observer(data)
     }

     observer(data) {
        //将data原有属性添加get和data属性

        //如果不是对象
        if(typeof data !== 'object' || !data) return 

        //拿出对象的属性 message, a
        Object.keys(data).forEach(key => {
            this.defineRective(data, key, data[key])
            this.observer(data[key])
        })
     }
     //定义响应式 obj:原数据 key:数据的属性 value：属性对应的值
     defineRective(obj, key, value){
       let that = this
       let dep = new Dep()//每个变化的数据都有一个数组，存放所有更新的操作
        Object.defineProperty(obj, key, {
            get() {  //Dep.target 是watch的实例
              Dep.target && dep.addSub(Dep.target)
              return value
            },
            set(newValue) {
              if(newValue !== value) {
                //set的值可以依旧是对象，比如data.message = {a:1},需要继续劫持
                that.observer(newValue);
                value = newValue;
                dep.notify() //通知所有人，更新了
              }
            } 
        })
     }
 }

 class Dep {
   constructor() {
     //订阅的数组
     this.subs = []
   }
   //订阅
   addSub(watcher) {
    this.subs.push(watcher)
   }
   //发布
   notify() {
    this.subs.forEach(watcher => {
      watcher.update()
    })
   }
 }