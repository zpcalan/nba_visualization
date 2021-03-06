var color=d3.merge([d3.schemeCategory20,d3.schemeCategory20b]);
    var app=new Vue({
        el:'#v',
        mounted:function () {
            this.csv1();
            this.csv2();
        },
        data:{
            index:{
                'ATL':0,'BOS':1,'BRK':2,'CHA':3,'CHI':4,'CLE':5,'DAL':6,'DEN':7,'DET':8,'GSW':9,'HOU':10,'IND':11,'LAC':12,'LAL':13,'MEM':14,'MIA':15,'MIL':16,'MIN':17,'NOP':18,'NYK':19,'OKC':20,'ORL':21,'PHI':22,'PHO':23,'POR':24,'SAC':25,'SAS':26,'TOR':27,'UTA':28,'WAS':29
            },
            team_mapping:{
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
            },
            teams:['ATL','BOS','BRK','CHA','CHI','CLE','DAL','DEN','DET','GSW','HOU','IND','LAC','LAL','MEM','MIA','MIL','MIN','NOP','NYK','OKC','ORL','PHI','PHO','POR','SAC','SAS','TOR','UTA','WAS'],
            overall:[],
            team_data:[],
            streak_data:[],
            text_data:[],
            points:[],
            rebound:[],
            assist:[],
            turnover:[],
            block:[],
            lines:[]
        },
        methods:{
            csv1:function () {
                d3.csv('/data/teamNames.csv',function (error,data) {
                    for(let i=0;i<data.length;i++){
                        let temp={};
                        temp.state=data[i].State;
                        temp.totalWin=data[i].Overall.split('-')[0];
                        temp.totalLost=data[i].Overall.split('-')[1];
                        app.overall.push(temp);
                    }
                    console.log('汇总：');
                    console.log(app.overall);
                    d3.csv('/data/leagues_NBA_2015_team.csv',function (error,data_own) {
                        d3.csv('/data/leagues_NBA_2015_opponent.csv',function (error,data_oppo) {
                            for(let i=0;i<data_own.length-1;i++){
                                let pts={};
                                let rbd={};
                                let ast={};
                                let tov={};
                                let blk={};
                                pts.state=rbd.state=ast.state=tov.state=blk.state=app.team_mapping[data_own[i].Team];
                                pts.totalWin=rbd.totalWin=ast.totalWin=tov.totalWin=blk.totalWin=app.overall[i].totalWin;
                                pts.totalLost=rbd.totalLost=ast.totalLost=tov.totalLost=blk.totalLost=app.overall[i].totalLost;
                                pts.own=(data_own[i].PTS/82).toFixed(1);pts.oppo=(data_oppo[i].PTS/82).toFixed(1);
                                rbd.own=(data_own[i].TRB/82).toFixed(1);rbd.oppo=(data_oppo[i].TRB/82).toFixed(1);
                                ast.own=(data_own[i].AST/82).toFixed(1);ast.oppo=(data_oppo[i].AST/82).toFixed(1);
                                tov.own=(data_own[i].TOV/82).toFixed(1);tov.oppo=(data_oppo[i].TOV/82).toFixed(1);
                                blk.own=(data_own[i].BLK/82).toFixed(1);blk.oppo=(data_oppo[i].BLK/82).toFixed(1);
                                app.points.push(pts);
                                app.rebound.push(rbd);
                                app.assist.push(ast);
                                app.turnover.push(tov);
                                app.block.push(blk);
                            }
                            app.callback();
                        })  
                    })
                })
            },
            csv2:function () {
                d3.csv('/data/gameScoreList_2015.csv', function(error, raw_data) {
                    var filtered_data = [];
                    for (let i = 0; i < raw_data.length; i++) {
                        let temp = {};
                        let raw = raw_data[i];
                        temp.diff = raw.HPTS - raw.VPTS;
                        temp.home = app.team_mapping[raw.Home];
                        temp.visitor = app.team_mapping[raw.Visitor];
                        temp.date = raw.Date;
                        temp.hpts = raw.HPTS;
                        temp.vpts = raw.VPTS;
                        filtered_data.push(temp);
                    }
                    for (let i = 0; i < 30; i++) {
                        // 比赛比分数据
                        app.team_data[i] = [];
                        for (let j = 0; j < filtered_data.length; j++) {
                            if (filtered_data[j].home == app.teams[i] || filtered_data[j].visitor == app.teams[i]) {
                                var temp = {};
                                for(property in filtered_data[j]){
                                    temp[property]=filtered_data[j][property];
                                }
                                temp.team=app.teams[i];
                                app.team_data[i].push(temp);
                            }
                        }
                        // 比赛连胜/败数据 连胜/败文本
                        // 1代表单独的胜败场 没有区分
                        app.streak_data[i]=[];
                        app.text_data[i]=[];
                        for(let j=0;j<app.team_data[i].length;j++){
                            let k=1,flag=1;
                            while(app.team_data[i][j+1]&&app.isSame(app.team_data[i][j],app.team_data[i][j+1])){
                                if(app.isSame(app.team_data[i][j],app.team_data[i][j+1])==-1)flag=-1;
                                j++;
                                k++;
                            }
                            for(let t=0;t<k;t++){
                                app.streak_data[i].push(flag*k);
                            }
                            if(k!=1){
                                var temp={};
                                temp.streak=flag*k;
                                temp.index=Math.floor((j+j-k+1)/2);
                                app.text_data[i].push(temp);
                            }
                        }
                    }
                    console.log("球队比赛比分：");
                    console.log(app.team_data);
                    app.callback();
                })
            },
            callback:function () {
                // 构造赛季数据
                if(app.overall.length!=0&&app.team_data.length!=0&&app.points.length!=0&&app.rebound.length!=0&&app.assist.length!=0&&app.turnover.length!=0&&app.block.length!=0){
                    for(let i=0;i<app.overall.length;i++){
                        app.overall[i].teamData=app.team_data[i];
                        app.overall[i].streakData=app.streak_data[i];
                        app.overall[i].textData=app.text_data[i];
                        for(let j=0;j<app.overall[i].teamData.length;j++){
                            app.overall[i].teamData[j].streak=app.streak_data[i][j];
                        }
                    }
                    app.bindData();
                }
            },
            bindData:function () {
                var maxScoreDiff=d3.max(app.team_data,function (d1) {
                    return d3.max(d1,function (d2) {
                        return Math.abs(d2.diff);
                    })
                })
                console.log('连胜数据：')
                console.log(app.streak_data)
                var maxStreak=d3.max(app.streak_data,function (d) {
                    return d3.max(d)
                })
                /******** 第一部分开始 ********/
                var totalSeason=d3.select('div.totalSeason')
                // 第一部分的每一行 相当于tr
                var team=totalSeason.selectAll('div')
                            .data(app.overall)
                            .enter()
                            .append('div')
                            .attr('class','team')
                            .style('height','60px')
                            .style('clear','both')//这里别忘记清楚浮动，否则最下面会有留白
                                .on('click',function (d,i) {
                                        d.selected=!d.selected;
                                        for(let i=0;i<app.points.length;i++){
                                            if(d.state==app.points[i].state){
                                                app.points[i].selected=!app.points[i].selected;
                                                d3.select(this).style('border',app.points[i].selected?'solid 1px yellow':'')
                                                break;
                                            }
                                        }
                                        for(let i=0;i<app.rebound.length;i++){
                                            if(d.state==app.rebound[i].state){
                                                app.rebound[i].selected=!app.rebound[i].selected;
                                                break;
                                            }
                                        }
                                        for(let i=0;i<app.assist.length;i++){
                                            if(d.state==app.assist[i].state){
                                                app.assist[i].selected=!app.assist[i].selected;
                                                break;
                                            }
                                        }
                                        for(let i=0;i<app.turnover.length;i++){
                                            if(d.state==app.turnover[i].state){
                                                app.turnover[i].selected=!app.turnover[i].selected;
                                                break;
                                            }
                                        }
                                        for(let i=0;i<app.block.length;i++){
                                            if(d.state==app.block[i].state){
                                                app.block[i].selected=!app.block[i].selected;
                                                break;
                                            }
                                        }
                                        for(let i=0;i<app.lines.length;i++){
                                            if(d.state==app.lines[i].state){
                                                app.lines[i].selected=!app.lines[i].selected;
                                                break;
                                            }
                                        }
                                        lineUpdate();
                                        highLight();
                                    })
                // 宽度高度margin等样式，便于后面连线
                var rowHeight=60;
                var rowWidth=1600;
                var padding=5;

                var totalWidth=150;
                var totalHeight=rowHeight-2*padding;

                var seasonWidth=rowWidth-totalWidth-2*padding-2*padding;
                var seasonHeight=rowHeight-2*padding;

                // 总胜负场
                var total=team.append('div')
                                .attr('class','total')
                                .style('padding','5px')
                                .style('width','150px')
                                .style('float','left')
                // 赛季比分
                var season=team.append('div')
                                .attr('class','season')
                                .style('padding','5px')
                                .style('float','left')

                // 总胜负场的svg
                var svg_total=total.append('svg')
                                    .attr('height',totalHeight)
                                    .attr('width',totalWidth-2*padding)
                                    // .on('click',function (d,i) {
                                    //     d.selected=!d.selected;
                                    //     for(let i=0;i<app.points.length;i++){
                                    //         if(d.state==app.points[i].state){
                                    //             app.points[i].selected=!app.points[i].selected;
                                    //             break;
                                    //         }
                                    //     }
                                    //     for(let i=0;i<app.rebound.length;i++){
                                    //         if(d.state==app.rebound[i].state){
                                    //             app.rebound[i].selected=!app.rebound[i].selected;
                                    //             break;
                                    //         }
                                    //     }
                                    //     for(let i=0;i<app.assist.length;i++){
                                    //         if(d.state==app.assist[i].state){
                                    //             app.assist[i].selected=!app.assist[i].selected;
                                    //             break;
                                    //         }
                                    //     }
                                    //     for(let i=0;i<app.turnover.length;i++){
                                    //         if(d.state==app.turnover[i].state){
                                    //             app.turnover[i].selected=!app.turnover[i].selected;
                                    //             break;
                                    //         }
                                    //     }
                                    //     for(let i=0;i<app.block.length;i++){
                                    //         if(d.state==app.block[i].state){
                                    //             app.block[i].selected=!app.block[i].selected;
                                    //             break;
                                    //         }
                                    //     }
                                    //     for(let i=0;i<app.lines.length;i++){
                                    //         if(d.state==app.lines[i].state){
                                    //             app.lines[i].selected=!app.lines[i].selected;
                                    //             break;
                                    //         }
                                    //     }
                                    //     lineUpdate();
                                    //     highLight();
                                    // })
                var win_lost_scale=d3.scaleLinear()
                                    .domain([0,82])
                                    .range([0,totalWidth]);
                // 总胜负场的矩形
                svg_total.append('rect')
                    .attr('height',totalHeight)
                    .attr('width',function (d) {
                        return win_lost_scale(d.totalWin);
                    })
                    .attr('fill','#71C671');
                svg_total.append('rect')
                    .attr('height',totalHeight)
                    .attr('width',function (d) {
                        return totalWidth-win_lost_scale(d.totalWin);
                    })
                    .attr('x',function (d) {
                        return win_lost_scale(d.totalWin);
                    })
                    .attr('fill','#FF3030');
                svg_total.append('text')
                        .text(function (d) {
                            return d.totalWin+'-'+d.totalLost+'   '+d.state;
                        })
                        .style('font-size',totalHeight/2)
                        .attr('dy',3*totalHeight/4)
                // 赛季比分的svg
                var svg_season=season.append('svg')
                                    .attr('height',seasonHeight)
                                    .attr('width',seasonWidth);
                // 赛季比分柱状图
                xAxis=d3.scaleBand()
                        .domain(d3.range(82))
                        .range([0,seasonWidth])
                        .paddingInner([0.3])
                        .paddingOuter([0.1]);
                yAxis=d3.scaleLinear()
                        .domain([0,maxScoreDiff])
                        .range([seasonHeight/2,0]);

                scoreUpdate(svg_season);

                // 赛季比分连胜/败曲线
                svg_season.each(function (d) {//将连胜败场次转换为坐标
                    var streakData=d.streakData;
                    var teamData=d.teamData;
                    d.streakLines=streakLines=[];
                    for(var i=0;i<streakData.length;){
                        let streak=Math.abs(streakData[i]);
                        if(streak>1){
                            for(let k=i;k<streak+i-1;k++){
                                let temp={};
                                let game1=teamData[k];
                                let game2=teamData[k+1];
                                temp.x1=xAxis(k)+xAxis.bandwidth()/2;
                                if(game1.team==game1.home&&game1.diff>0||game1.team==game1.visitor&&game1.diff<0)temp.y1=yAxis(Math.abs(game1.diff));
                                else temp.y1=yAxis(0)+seasonHeight/2-yAxis(Math.abs(game1.diff));

                                temp.x2=xAxis(k+1)+xAxis.bandwidth()/2;
                                if(game2.team==game2.home&&game2.diff>0||game2.team==game2.visitor&&game2.diff<0)temp.y2=yAxis(Math.abs(game2.diff));
                                else temp.y2=yAxis(0)+seasonHeight/2-yAxis(Math.abs(game2.diff));
                                temp.streak=streak;
                                streakLines.push(temp);
                            }
                        }
                        i+=streak;
                    }
                })
                svg_season.selectAll('line')
                            .data(function (d) {
                                return d.streakLines;
                            })
                            .enter()
                            .append('line')
                            .attr('x1',function (d) {
                                return d.x1;
                            })
                            .attr('x2',function (d) {
                                return d.x2;
                            })
                            .attr('y1',function (d) {
                                return d.y1;
                            })
                            .attr('y2',function (d) {
                                return d.y2;
                            })
                            .attr('stroke-width',0.5)
                            .attr('stroke','black')
                // 赛季比分streak提示文本
                svg_season.selectAll('text')
                            .data(function (d) {
                                return d.textData;
                            })
                            .enter()
                            .append('text')
                            .attr('x',function (d) {
                                return xAxis(d.index);
                            })
                            .attr('y',function (d) {
                                if(d.streak>0) return seasonHeight/2+10+2;
                                else return seasonHeight/2-2
                            })
                            .text(function (d) {
                                return Math.abs(d.streak);
                            })
                            .style('font-size','10px');
                /******** 第一部分结束 ********/
                /******** 第二部分开始 *********/
                var width=200;
                var margin=5;
                var height=50;
                var svg=d3.select('svg.boxscore')
                            .attr('width',1600)
                            .attr('height',2030)//这里不是很明确为什么$('.main').height()出来的和main的真实高度不同
                function position(type,num) {
                    var scale=d3.scaleLinear()
                            .domain([d3.min(app[type],function (d) {
                                return d3.min([Number(d.own),Number(d.oppo)]);
                            })-10,d3.max(app[type],function (d) {
                                return d3.max([Number(d.own),Number(d.oppo)]);
                            })])
                            .range([width/2,0]);
                    var type_g=svg.append('g')
                                .attr('transform','translate('+(50+250*num)+',80)')
                                .selectAll('g')
                                .data(app[type])
                                .enter()
                                .append('g')
                                .attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                })
                                .attr('class',type);
                    type_g.append('rect')
                            .attr('x',function (d,i) {
                                return scale(d.own);
                            })
                            .attr('width',function (d) {
                                return width/2-scale(d.own)
                            })
                            .attr('height',height)
                            .attr('fill','#71C671');
                    type_g.append('rect')
                            .attr('x',function (d,i) {
                                return width/2;
                            })
                            .attr('width',function (d) {
                                return width/2-scale(d.oppo)
                            })
                            .attr('height',height)
                            .attr('fill','#FF3030');
                    type_g.append('text')
                            .text(function (d) {
                                return d.own
                            })
                            .attr('dy',5)
                            .style('font-size','10px')
                            .style('color','black')
                            .attr('x',function (d) {
                                return 100-d.own.toString().length*10;
                            })
                            .attr('y',function (d) {
                                return height/2;
                            })
                    type_g.append('text')
                            .text(function (d) {
                                return d.oppo
                            })
                            .attr('x',function (d) {
                                return 100+10;
                            })
                            .attr('y',function (d) {
                                return height/2;
                            })
                            .attr('dy',5)
                            .style('font-size','10px')
                            .style('color','black');
                }
                position('points',0);
                position('rebound',1);
                position('assist',2);
                position('turnover',3);
                position('block',4);

                var points_g=svg.selectAll('g.points');
                var rebound_g=svg.selectAll('g.rebound');
                var assist_g=svg.selectAll('g.assist');
                var turnover_g=svg.selectAll('g.turnover');
                var block_g=svg.selectAll('g.block');
                lineUpdate();
                /******** 第二部分结束 *********/

                // 为了能够访问内部变量，将初始化和更新的函数作为闭包，有待优化
                $("#score_filter").ionRangeSlider({
                    min: 0,
                    max: maxScoreDiff+1,
                    from: maxScoreDiff+1,
                    grid: true,
                })
                $("#streak_filter").ionRangeSlider({
                    min: 0,
                    max: maxStreak+1,
                    from: maxStreak+1,
                    grid: true,
                })
                $("#score_filter").change(function () {
                    scoreUpdate(svg_season);
                })
                $("#streak_filter").change(function () {
                    scoreUpdate(svg_season);
                })
                // 高亮显示选择的队伍
                function highLight() {
                    var points_g=svg.selectAll('g.points');
                    var rebound_g=svg.selectAll('g.rebound');
                    var assist_g=svg.selectAll('g.assist');
                    var turnover_g=svg.selectAll('g.turnover');
                    var block_g=svg.selectAll('g.block');
                    // color[app.index[d.state]]
                    points_g.each(function (d,i) {
                        if(d.selected){
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',2)
                                .attr('stroke','black');
                        }
                        else{
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',0)
                        }
                    });
                    rebound_g.each(function (d,i) {
                        if(d.selected){
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',2)
                                .attr('stroke','black');
                        }
                        else{
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',0)
                        }
                    })
                    assist_g.each(function (d,i) {
                        if(d.selected){
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',2)
                                .attr('stroke','black');
                        }
                        else{
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',0)
                        }
                    })
                    turnover_g.each(function (d,i) {
                        if(d.selected){
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',2)
                                .attr('stroke','black');
                        }
                        else{
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',0)
                        }
                    })
                    block_g.each(function (d,i) {
                        if(d.selected){
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',2)
                                .attr('stroke','black');
                        }
                        else{
                            d3.select(this)
                                .selectAll('rect')
                                .attr('stroke-width',0)
                        }
                    })
                    d3.select('svg.boxscore')
                        .selectAll('line')
                        .each(function (d,i) {
                            if(d.selected){
                                d3.select(this)
                                    .attr('stroke-width',2)
                                    .attr('stroke','black')
                                    .attr('opacity',1);
                            }
                            else{
                                d3.select(this)
                                    .attr('stroke-width',1)
                                    .attr('stroke',function (d) {
                                        return d.wl==1?'green':'red'
                                    })
                                    .attr('opacity',0.5);
                            }
                        })
                }
                // 更新时间线显示符合条件的比赛
                function scoreUpdate(svg_season) {
                    var seasonUpdate=svg_season.selectAll('rect')
                                                .data(function (d) {
                                                    return d.teamData;
                                                });
                    var seasonEnter=seasonUpdate.enter();
                    seasonUpdate.attr('fill',function (d) {
                                    if(d.team==d.home&&d.diff>0||d.team==d.visitor&&d.diff<0){
                                        if(Math.abs(d.diff)>=$("#score_filter").val()&&Math.abs(d.streak)>=$("#streak_filter").val()){
                                            return '#00FF00';
                                        }
                                        return '#71C671';
                                    }
                                    else{
                                        if(Math.abs(d.diff)>=$("#score_filter").val()&&Math.abs(d.streak)>=$("#streak_filter").val()){
                                            return '#DA0505';
                                        }
                                        return '#FF3030';
                                    }
                                })
                                .attr('title',function (d,i) {
                                    return d.team+d.home+d.diff+d.date;
                                })
                                .attr('height',function (d) {
                                    return seasonHeight/2-yAxis(Math.abs(d.diff));
                                })
                                .attr('width',xAxis.bandwidth())
                                .attr('x',function (d,i) {
                                    return xAxis(i);
                                })
                                .attr('y',function (d,i) {
                                    if(d.team==d.home&&d.diff>0||d.team==d.visitor&&d.diff<0){
                                        return yAxis(Math.abs(d.diff));
                                    }
                                    else{
                                        return yAxis(0);
                                    }
                                });
                    seasonEnter.append('rect')
                                .attr('fill',function (d) {
                                    if(d.team==d.home&&d.diff>0||d.team==d.visitor&&d.diff<0){
                                        return '#71C671';
                                    }
                                    else{
                                        return '#FF3030';
                                    }
                                })
                                .attr('title',function (d,i) {
                                    return d.team+d.home+d.diff+d.date;
                                })
                                .attr('height',function (d) {
                                    return seasonHeight/2-yAxis(Math.abs(d.diff));
                                })
                                .attr('width',xAxis.bandwidth())
                                .attr('x',function (d,i) {
                                    return xAxis(i);
                                })
                                .attr('y',function (d,i) {
                                    if(d.team==d.home&&d.diff>0||d.team==d.visitor&&d.diff<0){
                                        return yAxis(Math.abs(d.diff));
                                    }
                                    else{
                                        return yAxis(0);
                                    }
                                })
                                .on('mouseenter',function (d,i) {
                                    svg_season.filter(function (_d,_i) {
                                        return _d.state==d.team;
                                    }).append('rect')
                                        .attr('class','mytitle')
                                        .attr('y',yAxis(0)-18)
                                        .attr("x",function () {
                                            if(i>73){
                                                return Number(xAxis(i))+Number(xAxis.bandwidth())-xAxis.bandwidth()-110-2;
                                            }
                                            else{
                                                return Number(xAxis(i))+Number(xAxis.bandwidth())+2
                                            }
                                        })  
                                        .attr('fill','white')
                                        .attr('fill-opacity',0)
                                        .attr('height',40)
                                        .attr('width',110)
                                        .attr('rx',4)
                                        .attr('ry',4)
                                        .transition()
                                        .duration(1000)
                                        .attr('fill-opacity',1)

                                    svg_season.filter(function (_d,_i) {
                                        return _d.state==d.team;
                                    }).append('text')
                                        .attr('class','mytitle')
                                        .attr('y',yAxis(0)-18)
                                        .attr("style", "fill: #000000; font-size: 12px;")
                                        .selectAll('tspan')
                                        .data([d.home+'-'+d.visitor,d.hpts+'-'+d.vpts,d.date])
                                        .enter()  
                                        .append("tspan")  
                                        .attr("x",function () {
                                            if(i>73){
                                                return Number(xAxis(i))+Number(xAxis.bandwidth())-xAxis.bandwidth()-110+3;
                                            }
                                            else{
                                                return Number(xAxis(i))+Number(xAxis.bandwidth())+3;
                                            }
                                        })  
                                        .attr("dy","1em")  
                                        .text(function(d){  
                                            return d;  
                                        })
                                        .attr('fill-opacity',0)
                                        .transition()
                                        .duration(1000)
                                        .attr('fill-opacity',1)
                                })
                                .on('mouseleave',function (d,i) {
                                    svg_season.select('text.mytitle')
                                                .remove();
                                    svg_season.select('rect.mytitle')
                                                .remove();
                                })

                }
                // 更新球队平均数据的线段
                function lineUpdate() {
                    app.lines=[];
                    var points_g=svg.selectAll('g.points');
                    var rebound_g=svg.selectAll('g.rebound');
                    var assist_g=svg.selectAll('g.assist');
                    var turnover_g=svg.selectAll('g.turnover');
                    var block_g=svg.selectAll('g.block');
                    function update(a,b,num) {
                        a.each(function (d1,i1) {
                            b.each(function (d2,i2) {
                                if(d1.state==d2.state){
                                    var temp={};
                                    temp.state=d1.state;
                                    if(d1.selected)temp.selected=true;
                                    else temp.selected=false;
                                    temp.x1=0+250*num;
                                    temp.x2=50+250*num;
                                    temp.y1=80+(5+$('.total').outerHeight()*i1)+height/2;//5为最外层的margin
                                    temp.y2=80+(5+$('.total').outerHeight()*i2)+height/2;
                                    temp.wl=d1.totalWin>=d1.totalLost?1:-1;
                                    app.lines.push(temp);
                                }
                            })
                        })
                    }
                    update(d3.selectAll('div.total'),points_g,0);
                    update(points_g,rebound_g,1);
                    update(rebound_g,assist_g,2);
                    update(assist_g,turnover_g,3);
                    update(turnover_g,block_g,4);

                    updateLine=d3.select('svg.boxscore')
                                .selectAll('line')
                                .data(app.lines);
                    enterLine=updateLine.enter();
                    enterLine.append('line')
                            .attr('x1',function (d) {
                                return d.x1;
                            })
                            .attr('y1',function (d) {
                                return d.y1;
                            })
                            .attr('x2',function (d) {
                                return d.x2;
                            })
                            .attr('y2',function (d) {
                                return d.y2;
                            })
                            .attr('stroke-width',1)
                            .attr('stroke',function (d) {
                                return d.wl==1?'green':'red'
                            })
                            .attr('opacity',0.5);
                    updateLine.attr('x1',function (d) {
                                    return d.x1;
                                })
                                .attr('y1',function (d) {
                                    return d.y1;
                                })
                                .attr('x2',function (d) {
                                    return d.x2;
                                })
                                .attr('y2',function (d) {
                                    return d.y2;
                                });
                }
                // 交互操作
                $('.win').click(function () {
                    var time_series=d3.selectAll('div.team');
                    time_series.sort(function (a,b) {
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
                    lineUpdate();
                    highLight();
                })
                $('.lost').click(function () {
                    var time_series=d3.selectAll('div.team');
                    time_series.sort(function (b,a) {
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
                    lineUpdate();
                    highLight();
                })
                $('.points button').click(function () {
                    var points_g=svg.selectAll('g.points');
                    var type=$(this).find('i').prop('class').split(' ')[2];
                    if(type=='fa-sort'||type=='fa-sort-amount-asc'){
                        points_g.sort(function (a,b) {
                                    return b.own-a.own;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                });
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-desc');
                    }
                    else{
                        points_g.sort(function (a,b) {
                                    return b.oppo-a.oppo;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                }); 
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-asc');
                    }
                    lineUpdate();
                    highLight();
                })
                $('.rebound button').click(function () {
                    var rebound_g=svg.selectAll('g.rebound')
                    var type=$(this).find('i').prop('class').split(' ')[2];
                    if(type=='fa-sort'||type=='fa-sort-amount-asc'){
                        rebound_g.sort(function (a,b) {
                                    return b.own-a.own;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                });
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-desc');
                    }
                    else{
                        rebound_g.sort(function (a,b) {
                                    return b.oppo-a.oppo;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                }); 
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-asc');
                    }
                    lineUpdate();
                    highLight();
                })
                $('.assist button').click(function () {
                    var assist_g=svg.selectAll('g.assist')
                    var type=$(this).find('i').prop('class').split(' ')[2];
                    if(type=='fa-sort'||type=='fa-sort-amount-asc'){
                        assist_g.sort(function (a,b) {
                                    return b.own-a.own;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                });
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-desc');
                    }
                    else{
                        assist_g.sort(function (a,b) {
                                    return b.oppo-a.oppo;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                }); 
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-asc');
                    }
                    lineUpdate();
                    highLight();
                })
                $('.turnover button').click(function () {
                    var turnover_g=svg.selectAll('g.turnover')
                    var type=$(this).find('i').prop('class').split(' ')[2];
                    if(type=='fa-sort'||type=='fa-sort-amount-asc'){
                        turnover_g.sort(function (a,b) {
                                    return b.own-a.own;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                });
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-desc');
                    }
                    else{
                        turnover_g.sort(function (a,b) {
                                    return b.oppo-a.oppo;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                }); 
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-asc');
                    }
                    lineUpdate();
                    highLight();
                })
                $('.block button').click(function () {
                    var block_g=svg.selectAll('g.block')
                    var type=$(this).find('i').prop('class').split(' ')[2];
                    if(type=='fa-sort'||type=='fa-sort-amount-asc'){
                        block_g.sort(function (a,b) {
                                    return b.own-a.own;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                });
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-desc');
                    }
                    else{
                        block_g.sort(function (a,b) {
                                    return b.oppo-a.oppo;
                                }).attr('transform',function (d,i) {
                                    return 'translate(0'+','+(5+65*i)+')';
                                }); 
                        $(this).find('i').prop('class','fa fa-fw fa-sort-amount-asc');
                    }
                    lineUpdate();
                    highLight();
                })
            },
            winLost:function (a) {
                if(a.home==a.team&&a.diff>0||a.home!=a.team&&a.diff<0)return 1;
                else return 0;
            },
            isSame:function (a,b) {
                if(app.winLost(a)==1&&app.winLost(b)==1){
                    return 1;
                }
                else if(app.winLost(a)==0&&app.winLost(b)==0){
                    return -1;
                }
                else{
                    return 0;
                }
            }
        }
    })