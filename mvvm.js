class Vue {
    constructor(options){
        this.$el = options.el; //元素
        this.$data = options.data; //数据

        //如果有编译模板就开始编译
        if(this.$el) {
            //1.数据劫持，添加set和get方法
            new Observer(this.$data)

            //2.用数据和元素进行编译,
            new Compile(this.$el, this)
        }
    }
}