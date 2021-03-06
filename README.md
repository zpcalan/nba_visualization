# nba visualization——NBA数据可视化

### 12月4日：
    创建服务器，搭建目录
    通过app.get()控制路由：根据路径的不同返回不同的html，需要传入文件的绝对路径，即静态目录/public也要写入。
    胜负关系数据重构，每个队伍之间的战绩通过对象表示，方便进行sort()操作；将球队所在州，球队名，总胜场和负场数都以对象属性的形式添加。
    td绑定的数据和th的数据不同，也是为了方便排序。
    所有比赛数据重构，删去了不必要的属性。
    构造出每支队伍每场比赛的对象数组，并通过遍历再次修改tdData，方便红绿条的绑定。

### 12月5日：
    重构昨天的数据结构，在每支队伍相关的对象里面都加了总胜场和总负场数量，方便排序。
    优化表格样式，数据绑定和显示基本完成。
    矩形的添加用了d3.js柱状图绘制的知识点，美观并且灵活。

### 12月6日：
    添加td单元的交互功能，鼠标悬浮时放大，并且显示比赛比分，比分部分的布局还未优化完毕，暂时不上。
    添加胜负场次排序功能。
    胜负关系矩阵基本完成，td单元交互有待优化。
    思考了一下赛季视图的数据绑定方法：
    球队胜负场次和球队所有比赛红绿柱状图一起绑定，和矩阵视图一样。
    后半部分视图，得分，抢断等矩形，以列为单位绑定数据(一列绑定一次)。
    线段也以列绑定，但是绘制的时候需要获取得分，抢断等矩形的数据下标index。

### 12月8日：
    添加了赛季视图的前半部分，矩形部分完成。
    div布局浮动时别忘记清除父节点的浮动，否则会出现样式错误。
    折线是通过大量的数据重组来获得line所需要绑定的数据，每组数据单元是代表本次连胜的场次，并且每个再此连胜内的数据单元都有相应的数据，特别要记住是由数据驱动的视图，有了数据才能画出line。
    在通过slider筛选数据时，绑定onchange事件。

### 12月9日：
    重新思考了第二部分线段的绘制。
    暂时将一些函数作为闭包放入绑定函数中，如slider组件初始化、视图更新等等，有待优化。

### 12月10日：
    经过测试，通过d3的语法绑定vue的data数据到vue的属性上，无法实现双向绑定，猜测是因为没有通过html绑定data，因此vue无法识别。
    暂时用了vue，但是里面用到的并没有和其核心内容相关的东西，看后面能不能优化成双向绑定的。
    基本完成，界面美化和额外交互还需进一步优化。

### 12月11日：
    今天搞定了高亮显示的交互。

### 4月5日：
    前面一段时间主要做了UI优化和交互，最近一星期开始视图三的构思和编码
