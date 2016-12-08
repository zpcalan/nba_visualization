    var team_mapping={
        'Atlanta Hawks':'ATL',
        'Boston Celtics':'BOS',
        'Brooklyn Nets':'BRK',
        'Charlotte Hornets':'CHA',
        'Chicago Bulls':'CHI',
        'Cleveland Cavaliers':'CLE',
        'Dallas Mavericks':'DAL',
        'Denver Nuggets':'DEN',
        'Detroit Pistons':'DET',
        'Golden State Warriors':'GSW',
        'Houston Rockets':'HOU',
        'Indiana Pacers':'IND',
        'Los Angeles Clippers':'LAC',
        'Los Angeles Lakers':'LAL',
        'Memphis Grizzlies':'MEM',
        'Miami Heat':'MIA',
        'Milwaukee Bucks':'MIL',
        'Minnesota Timberwolves':'MIN',
        'New Orleans Pelicans':'NOP',
        'New York Knicks':'NYK',
        'Oklahoma City Thunder':'OKC',
        'Orlando Magic':'ORL',
        'Philadelphia 76ers':'PHI',
        'Phoenix Suns':'PHO',
        'Portland Trail Blazers':'POR',
        'Sacramento Kings':'SAC',
        'San Antonio Spurs':'SAS',
        'Toronto Raptors':'TOR',
        'Utah Jazz':'UTA',
        'Washington Wizards':'WAS'
    }
    var teams=[];
    function mapping(overall,state) {
        for(let i=0;i<overall.length;i++){
            if(overall[i].state==state)return i;
        }
    }
/**************************************数据重构部分开始*************************************************/
    d3.csv('/data/teamNames.csv',function (error,data) {
        var overall=[];
        for(let i=0;i<data.length;i++){
            let temp={};
            temp.state=data[i].State;
            temp.totalWin=data[i].Overall.split('-')[0];
            temp.totalLost=data[i].Overall.split('-')[1];
            overall.push(temp);
        }
        console.log('球队总胜负场：')
        console.log(overall);
        d3.csv('/data/winLostMatrix_2015.csv',function (error,data) {
            var tr_data=data;
            var th_data=overall;
            tr_data[29].WAS="";//特殊情况人工处理
            // 数据重构
            for(let i=0;i<tr_data.length;i++){
                tr_data[i].tdData=[];
                for(let property in tr_data[i]){
                    let temp=tr_data[i];

                    if(!temp[property]){
                        if(i==0)teams.push(property);
                        temp.state=property;
                        temp[property]={
                            'win':0,
                            'lost':0,
                            'state':property,
                        }
                        temp.tdData.push(temp[property])
                        temp[property].totalWin=overall[mapping(overall,property)].totalWin;
                        temp[property].totalLost=overall[mapping(overall,property)].totalLost;
                    }
                    else if(property=='Team'){
                        temp.Name=temp[property].split(' ')[2]?temp[property].split(' ')[2]:temp[property].split(' ')[1];
                    }
                    else if(property=='Rk'){}
                    else if(property!='tdData'&&property!='totalWin'&&property!='totalLost'&&property!='Name'&&property!='state'){
                        if(i==0)teams.push(property);
                        let win=temp[property].split('-')[0];
                        let lost=temp[property].split('-')[1];
                        temp[property]={
                            'win':win,
                            'lost':lost,
                            'state':property,
                        }
                        temp.tdData.push(temp[property])//用于绑定列数据的数组
                        temp[property].totalWin=overall[mapping(overall,property)].totalWin;
                        temp[property].totalLost=overall[mapping(overall,property)].totalLost;
                    }
                }
                tr_data[i].totalWin=overall[mapping(overall,tr_data[i].state)].totalWin;
                tr_data[i].totalLost=overall[mapping(overall,tr_data[i].state)].totalLost;
            }
            console.log('tr_data：')
            console.log(tr_data)
            d3.csv('/data/gameScoreList_2015.csv',function (error,raw_data) {
                var filtered_data=[];
                // 所有比赛数据重构 在制作第二张图表时会用到
                // 计算分差时是主队在前，客队在后
                for(let i=0;i<raw_data.length;i++){
                    let temp={};
                    let raw=raw_data[i];
                    temp.diff=raw.HPTS-raw.VPTS;
                    temp.home=team_mapping[raw.Home];
                    temp.visitor=team_mapping[raw.Visitor];
                    temp.hpts=raw.HPTS;
                    temp.vpts=raw.VPTS
                    filtered_data.push(temp);
                }
                // 每个队伍的比赛数据筛选
                // 按照字母顺序存储
                var team_data=[];
                for(let i=0;i<30;i++){
                    team_data[i]=[];
                    for(let j=0;j<filtered_data.length;j++){
                        if(filtered_data[j].home==teams[i]||filtered_data[j].visitor==teams[i]){
                            team_data[i].push(filtered_data[j]);
                        }
                    }
                }
                console.log("球队比赛比分：")
                console.log(team_data)
                // 遍历tr_data[tdData[team_data]]
                for(let i=0;i<tr_data.length;i++){
                    for(let j=0;j<tr_data[i].tdData.length;j++){
                        let tr=tr_data[i]
                        let td=tr_data[i].tdData[j];
                        td.diff=[];
                        var count=0;
                        for(let k=0;k<team_data[i].length;k++){
                            let tmp=team_data[i][k];
                            if(tmp.home==tr.state&&tmp.visitor==td.state){
                                count++;
                                td[count]=tmp.hpts+'-'+tmp.vpts;
                                td.diff.push(tmp.diff);
                            }
                            else if(tmp.home==td.state&&tmp.visitor==tr.state){
                                count++;
                                td[count]=tmp.hpts+'-'+tmp.vpts;
                                td.diff.push(-tmp.diff);
                            }
                            else continue;
                        }
                    }
                }
/**************************************数据重构部分结束*************************************************/

/**************************************绑定数据部分开始*************************************************/
            var th=d3.select('.head tr')
                    .selectAll('.th_not_first')
                    .data(th_data)
                    .enter()
                    .append('th')
            th.attr('class','th_not_first')
                .append('p')
                .text(function (d) {
                    return d.state;
                })
            var tr=d3.select('table tbody')
                    .selectAll('tr')
                    .data(tr_data)
                    .enter()
                    .append('tr');
            var td_first=tr.append('td').attr('class','td_first');
            var td_not_first=tr.selectAll('.td_not_first')
                    .data(function (d) {
                        return d.tdData;
                    })
                    .enter()
                    .append('td')
                    .attr('class','td_not_first');


            var td1_width=$('.td_first').eq(0).width()-10;//首个td的宽度 较长
            var tdn_width=tdn_height=td1_height=$('.td_not_first').eq(0).width();//后面td的宽度、高度和首个td的高度一致
            /********************绑定第一列数据开始*****************/
                var svg_1=td_first.append('div')
                                    .style('height',td1_height+'px')
                                    .style('width',td1_width+'px')
                                    .append('svg')
                                    .style('height',td1_height)
                                    .style('width',td1_width)
                var win_lost_scale=d3.scaleLinear()
                                    .domain([0,82])
                                    .range([0,td1_width]);
                svg_1.append('rect')
                        .attr('height',td1_height)
                        .attr('width',function (d) {
                            return win_lost_scale(d.totalWin);
                        })
                        .attr('fill','#71C671');
                svg_1.append('rect')
                        .attr('height',td1_height)
                        .attr('width',function (d) {
                            return td1_width-win_lost_scale(d.totalWin);
                        })
                        .attr('x',function (d) {
                            return win_lost_scale(d.totalWin);
                        })
                        .attr('fill','#FF3030');
                var text=svg_1.append('text')
                    .text(function (d) {
                        return d.totalWin+'-'+d.totalLost+'   '+d.Name;
                    })
                    .style('font-size',td1_height/2)
                    .attr('dy',3*td1_height/4)
            /********************绑定第一列数据结束*****************/
            /********************绑定第一列后的数据开始*****************/
                var svg_n=td_not_first.append('div')
                                    .style('height',tdn_width+'px')
                                    .style('width',tdn_width+'px')
                                    .attr('class',function (d) {
                                        if(d.win>d.lost)return 'green'
                                        else if(d.win<d.lost)return 'red'
                                        else return 'white'
                                    })
                                    .style('margin-top',-tdn_width/2+'px')
                                    /*****td交互部分开始*****/
                                    .on('mouseover',function (d) {
                                        d3.select(this)
                                            .transition()
                                            .duration(0)
                                            .style('width',function (d) {
                                                return tdn_width*2+2+'px'
                                            })
                                            .style('height',function (d) {
                                                return tdn_width*2+1+'px'
                                            })
                                            .style('z-index',3000)
                                    })
                                    .on('mouseout',function (d) {
                                        d3.select(this)
                                            .transition()
                                            .duration(0)
                                            .style('width',function (d) {
                                                return tdn_width+'px'
                                            })
                                            .style('height',function (d) {
                                                return tdn_width+'px'
                                            })
                                            .style('z-index',2000)
                                    })
                                    /*****td交互部分结束*****/
                                    .append('svg')
                                    .attr('height',tdn_width)
                                    .attr('width',tdn_width)
                // yAxis是为了方便分差矩形布局平均
                var yAxis=d3.scaleBand()
                      .domain(d3.range(4))
                      .range([1,tdn_height-2])
                      .paddingInner([0.3])
                      .paddingOuter([0.1])
                // xAxis矩形宽度的映射
                var xAxis=d3.scaleLinear()
                       .domain([0,60])
                       .range([1,tdn_width]);
                svg_n.selectAll('rect')
                    .data(function (d) {
                        return d.diff;
                    })
                    .enter()
                    .append('rect')
                    .attr('fill',function (d) {
                        if(d>0)return '#71C671'
                        else return '#FF3030'
                    })
                    .attr('height',yAxis.bandwidth())
                    .attr('width',function (d) {
                        return xAxis(Math.abs(d));
                    })
                    .attr('y',function (d,i) {
                        return yAxis(i);
                    })
            /********************绑定第一列后的数据结束*****************/
            })
        })
    });
    function win() {
        var tr=d3.select('table tbody')
            .selectAll('tr');
        var td_not_first=tr.selectAll('.td_not_first');
        var th=d3.select('.head tr')
                .selectAll('.th_not_first');
        tr.sort(function (a,b) {
            if(b.totalWin>a.totalWin){
                return 1;
            }
            else if(b.totalWin==a.totalWin){
                return a.state.localeCompare(b.state);
            }
            else{
                return -1;
            }
        });
        td_not_first.sort(function (a,b) {
            if(b.totalWin>a.totalWin){
                return 1;
            }
            else if(b.totalWin==a.totalWin){
                return a.state.localeCompare(b.state);
            }
            else{
                return -1;
            }
        });
        th.sort(function (a,b) {
            if(b.totalWin>a.totalWin){
                return 1;
            }
            else if(b.totalWin==a.totalWin){
                return a.state.localeCompare(b.state);
            }
            else{
                return -1;
            }
        })
    }
    function lost() {
        var tr=d3.select('table tbody')
            .selectAll('tr');
        var td_not_first=tr.selectAll('.td_not_first');
        var th=d3.select('.head tr')
                .selectAll('.th_not_first');
        tr.sort(function (b,a) {
            if(b.totalWin>a.totalWin){
                return 1;
            }
            else if(b.totalWin==a.totalWin){
                return a.state.localeCompare(b.state);
            }
            else{
                return -1;
            }
        });
        td_not_first.sort(function (b,a) {
            if(b.totalWin>a.totalWin){
                return 1;
            }
            else if(b.totalWin==a.totalWin){
                return a.state.localeCompare(b.state);
            }
            else{
                return -1;
            }
        });
        th.sort(function (b,a) {
            if(b.totalWin>a.totalWin){
                return 1;
            }
            else if(b.totalWin==a.totalWin){
                return a.state.localeCompare(b.state);
            }
            else{
                return -1;
            }
        })
    }