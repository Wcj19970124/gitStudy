new Vue({
    el: "#query",
    data() {
        return {
            page: {
                PageNo: 0, //默认页码
                PageSize: 5, //默认每页显示的数据条数
                TotalPage: 0, //默认总页数
                TotalCount: 0, //默认数据总条数
                StartNo: 0, //默认的首条数据索引
                List: [], //管理员数据
                Params: {
                    weex: "",
                    component: "",
                    js: "",
                }, //查询参数
            },
            js: "", //根据公共JS查询Weex页面的条件参数
            weex: "", //根据Weex页面查询公共组件/JS的条件参数
            component: "", //根据公共组件查询Weex页面的条件参数
            cacheWeex: [], //下拉列表的Weex数据
            cacheComponent: [], //下拉列表的Component数据
            cacheJs: [], //下拉列表的Js数据
            notRequireComponent: [], //未被引用到的公共组件
            notRequireJs: [], //未被引用的公共JS
            category: [], //依赖关系图中的节点类型
            chartData: [], //依赖关系图的展示数据
            links: [], //依赖关系图中的关系数据
        }
    },
    created() {
        this.getHomeData();
        this.getRelyList();
        this.getRelyData();
    },
    //监听事件
    watch: {
        links: function (val) {
            if (val != null) {
                this.initChart(this.category, this.chartData, this.links);
            }
        },
    },
    methods: {
        //下拉列表缓存数据
        getHomeData() {
            var _this = this;
            $.ajax({
                url: "http://127.0.0.1:8081/home",
                type: "Get",
                dataType: "json",
                timeout: 5000,
                success: function (res) {
                    _this.cacheWeex = res.data.Weex;
                    _this.cacheComponent = res.data.component;
                    _this.cacheJs = res.data.js;
                }
            })
        },
        //分页查询依赖关系列表
        getRelyList() {
            var _this = this;
            $.ajax({
                url: "http://127.0.0.1:8081/query/list?page=" + JSON.stringify(_this.page),
                type: "GET",
                dataType: "json",
                timeout: 5000,
                success: function (res) {
                    _this.page = res.data.page;
                    _this.notRequireComponent = res.data.notRequire.notRequireComponent;
                    _this.notRequireJs = res.data.notRequire.notRequireJs;
                }
            })
        },
        //获取Weex-Component-Js三者之间依赖关系数据
        getRelyData() {
            var _this = this;
            $.ajax({
                url: "http://127.0.0.1:8081/query/rely",
                type: "GET",
                dataType: "json",
                timeout: 5000,
                success: function (res) {
                    _this.category = res.data.category;
                    _this.chartData = res.data.chartData;
                    _this.links = res.data.links;
                }
            })

        },
        //更改页码时触发的事件
        handleCurrentChange(val) {
            this.page.pageNo = val - 1;
            this.page.List = [];
            this.getRelyList();
        },
        //更改每页显示的数据条数触发事件
        handleSizeChange(val) {
            this.page.PageSize = val;
            this.page.List = [];
            this.getRelyList();
        },
        //带条件分页查询
        onSubmit() {
            this.page.TotalPage = 0;
            this.page.TotalCount = 0;
            this.page.List = [];
            this.page.Params = {
                weex: this.weex,
                component: this.component,
                js: this.js,
            };
            this.getRelyList(this.page);
        },
        indexMethod(index) {
            return index + 1;
        },
        //初始化图表
        initChart(category, chartData, links) {
            let myChart = echarts.init(document.getElementById("echart"));
            myChart.resize(); //自适应大小
            myChart.setOption(this.setOption(category, chartData, links));
        },
        setOption(category, chartData, links) {
            let option = {
                //关系图标题设置
                title: {
                    text: "Weex-Component-Js依赖关系图",
                    top: "bottom",
                    left: "right",
                    textStyle: {
                        fontSize: 15,
                        fontWeight: "normal",
                    },
                },
                //提示框
                tooltip: {
                    formatter: function (x) {
                        if (x.data.source) {
                            return x.data.label;
                        } else {
                            return category[x.data.category].name + "：" + x.data.name;
                        }
                    },
                },
                //显示分类小图标
                legend: [
                    {
                        show: true,
                        x: "left",
                        data: category.map(function (a) {
                            return a.name;
                        }),
                    },
                ],
                animationDurationUpdate: 1500,
                animationEasingUpdate: "quinticInOut",
                series: [
                    {
                        type: "graph", //类型
                        layout: "none", //格式
                        data: chartData, //数据
                        links: links, //关联关系
                        categories: category, //分类
                        roam: true, //鼠标缩放和平移功能
                        focusNodeAdjacency: true, //鼠标移到节点上时突出显示结点以及邻节点和边
                        //节点的name显示，暂放
                        label: {
                            show: true,
                            position: "left",
                            formatter: "{b}",
                            textStyle: {
                                fontWeight: "bold",
                            },
                        },
                        //关系边的样式
                        lineStyle: {
                            color: "target",
                            curveness: 0.3,
                        },
                        //高亮状态
                        emphasis: {
                            focus: "adjacency",
                            lineStyle: {
                                width: 6,
                            },
                        },

                        color: ["#ee6666", "#4F94CD", "#3ba272"], //种类颜色
                        animation: "auto",
                        animationDurationUpdate: 500,
                        animationEasing: "cubicInout",
                        animationThreshold: 2000,
                        progressiveThreshold: 3000,
                        progressive: 400,
                        hoverLayerThreshold: 3000,
                        stateAnimation: {
                            duration: 300,
                            easing: "cubicOut",
                        },
                    },
                ],
            };
            return option;
        },
    },
})