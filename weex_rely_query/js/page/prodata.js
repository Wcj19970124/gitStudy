new Vue({
    el: '#index',
    data() {
        this.typeArr = ["histogram", "line"]; //图表类型
        this.index = 0; //切换图表类型索引
        return {
            js: [], //接收现有公共JS数据
            jsDir: [], //接收公共Js所在目录
            weex: [], //接收现有Weex数据
            component: [], //接收现有公共组件数据
            componentDir: [], //接收公共组件所在的目录
            searchWeex: "", //Weex页面绑定搜索值
            searchComponentDir: "", //Component根据目录进行删选
            searchJsDir: "", //Js根据目录进行删选
            searchComponent: "", //Component根据名称进行删选
            searchJs: "", //Js根据名称进行删选
            chartData: {
                columns: ["weex", "depComponentNum", "depJsNum"],
                rows: [], //接收Weex页面依赖的组件/JS数量数据
            },
            //横坐标倾斜角度
            extend: {
                "xAxis.0.axisLabel.rotate": 60,
            },
            chartSettings: {
                //配置别名
                legendName: {
                    depComponentNum: "公共组件",
                    depJsNum: "公共JS",
                },
                type: this.typeArr[this.index],
            },
        }
    },
    created() {
        this.getHomeData();
    },
    methods: {
        getHomeData() {
            var _this = this;
            $.ajax({
                url: "http://127.0.0.1:8081/home",
                type: "get",
                dataType: "json",
                timeout: 5000,
                success: function (res) {
                    _this.weex = res.data.Weex;
                    _this.component = res.data.component;
                    _this.componentDir = res.data.componentDir;
                    _this.js = res.data.js;
                    _this.jsDir = res.data.jsDir;
                    _this.chartData.rows = res.data.weexDependence;
                },
            })
        },
        //图表类型切换
        changeType() {
            this.index++;
            if (this.index >= this.typeArr.length) {
                this.index = 0;
            }
            this.chartSettings.type = this.typeArr[this.index];
        },
        //公共组件过滤器
        filterComponent() {
            //按目录过滤
            var arr = [];
            this.component.filter((data) => {
                if (
                    data.component
                        .toLowerCase()
                        .includes(this.searchComponentDir.toLowerCase())
                ) {
                    arr.push(data);
                }
            });
            //按关键字过滤
            var res = [];
            this.component.filter((data) => {
                if (
                    data.component
                        .toLowerCase()
                        .includes(this.searchComponent.toLowerCase())
                ) {
                    res.push(data);
                }
            });
            if (this.searchComponentDir != "" && this.searchComponent != "") {
                return arr.filter((v) => res.includes(v)); //交集
            } else if (this.searchComponentDir != "") {
                return arr;
            } else if (this.searchComponent != "") {
                return res;
            } else {
                return this.component;
            }
        },
        //公共JS过滤器
        filterJs() {
            //按目录过滤
            var arr = [];
            this.js.filter((data) => {
                if (data.js.toLowerCase().includes(this.searchJsDir.toLowerCase())) {
                    arr.push(data);
                }
            });
            //按关键字过滤
            var res = [];
            this.js.filter((data) => {
                if (data.js.toLowerCase().includes(this.searchJs.toLowerCase())) {
                    res.push(data);
                }
            });
            if (this.searchJsDir != "" && this.searchJs != "") {
                return arr.filter((v) => res.includes(v));
            } else if (this.searchJsDir != "") {
                return arr;
            } else if (this.searchJs != "") {
                return res;
            } else {
                return this.js;
            }
        },
    },
})