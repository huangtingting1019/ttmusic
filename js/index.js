let $ = require('jquery');

require('../css/index.css');

let pauseImg = require('../images/pause.png');

let playImg  = require('../images/play.png');

let like = require('../images/like.png');

let like1 = require('../images/like1.png');

let like_active = require('../images/like_active.png');

let deleteImg = require('../images/delete.png');

let modeIcons = {
  liebiao: require('../images/list.png'),
  random: require('../images/random.png'),
  danqu_32: require('../images/danqu_32.png')
};

$(function () {
  
  //初始化最近播放，收藏数据结构
  function initSongConstruct() {
    var songItems = ['recentSong', 'likeSong'];

    for (var i = 0; i < songItems.length; i++) {
      var d = localStorage.getItem(songItems[i]);

      //如果不存在数据结构
      if (!d) {
        localStorage.setItem(songItems[i], JSON.stringify([]));
      }
    }

  }

  initSongConstruct();

  //获取进度条的总长度
  var progressWidth = $('.progress').width();
  // 

  //获取滑块的宽度
  var maskWidth = $('.mask').width();
  // 

  //mask最小left
  var minLeft = 0;

  //mask最大left
  var maxLeft = progressWidth - maskWidth;

  //获取音频标签
  var audio = $('#audio')[0];

  //是否播放完成
  // var isEnd = false;

  //暂停播放
  $('#play-pause').on('click', function () {

    //获取音频链接
    var src = $(audio).attr('src');

    if (!src) {
      
      return;
    }

    //获取音频播放状态 data-play: 0暂停，1播放

    var status = $(this).data('play');

    if (status == 0) {
      audio.play();

      $(this).data('play', 1).css({
        backgroundImage: 'url("' + playImg + '")'
      })


    } else {
      //如果是播放，则需要暂停
      audio.pause();
      $(this).data('play', 0).css({
        backgroundImage: 'url("' +pauseImg  + '")'
      })
    }

  })

  //当音频播放结束时
  audio.onended = function () {
    //将data-play修改为0
    $('.play-pause').data('play', 0);
    // isEnd = true;

    //根据模式自动播放下一首歌曲
    playNextSong('next');

  }

  //顺序播放下一首 或者 随机播放一首
  function playNextSong(type, isAuto) {

    //type: 上一首 prev，下一首 next
    //isAuto: 是否歌曲播放完成后自动播放

    isFirstPlay = true;

    //获取所有歌曲列表
    var $songList = $('.song-list-item');

    //当前激活的歌曲列表
    var $activeItem = $('.song-list-item.active');

    //获取播放模式
    var mode = $('#mode').attr('name');

    if (mode == 0 || (mode == 2 && isAuto === false)) {
      //列表循环
      //获取激活的歌曲下标
     
      var activeSongIndex = $activeItem.index();

      //下一个歌曲列表或者上一个歌曲列表
      var $nextItem = null;

      if (type == 'next') {
        if (activeSongIndex == $songList.length - 1) {
          //如果是最后一首歌，则播放第一首
          $nextItem = $songList.eq(0);

        } else {

          //播放下一首
          $nextItem = $songList.eq(activeSongIndex + 1);
        }
      } else {

        if (activeSongIndex == 0) {
          //如果是第一首歌曲，则播放最后一首歌曲
          $nextItem = $songList.eq($songList.length - 1);
        } else {
          //播放上一首
          $nextItem = $songList.eq(activeSongIndex - 1);
        }

      }

      //移除当前的激活类名
      $activeItem.removeClass('active');

      $nextItem.addClass('active');

      //关联id
      var id = $nextItem.attr('id');

      $('#play-pause').attr('name', id);

      //获取音频链接
      var audioUrl = $nextItem.data('url');

      $(audio).attr('src', audioUrl);

    } else if (mode == 1) {
      //随机播放
      //获取随机下标
      var randomIndex = Math.floor(Math.random() * $songList.length);
      
      //随机获取一个歌曲列表
      var $randomItem = $songList.eq(randomIndex);

      //移除当前的激活类名
      $activeItem.removeClass('active');

      $randomItem.addClass('active');

      //关联id
      var id = $randomItem.attr('id');

      $('#play-pause').attr('name', id);

      //获取音频链接
      var audioUrl = $randomItem.data('url');

      $(audio).attr('src', audioUrl);

    } else {
      //单曲循环

      //重新播放
      audio.load();

    }

    
  }

  //下一首
  $('.next').on('click', function () {

    playNextSong('next', false);

  })

  //上一首
  $('.prev').on('click', function () {
    playNextSong('prev', false);
  })

  //是否是第一次播放
  var isFirstPlay = true;

  //音频总时间
  var duration = 0;


  // 时间格式化
  function formatTime(sec) {
    //sec: 秒数
    //不足10，需要补零
    var minute = Math.floor(sec / 60);
    minute = minute >= 10 ? minute : '0' + minute;

    var second = Math.floor(sec % 60);

    second = second >= 10 ? second : '0' + second;

    return minute + ':' + second;
  }


  //获取歌词
  function getSongWord(url) {
    $.ajax({
      type: 'get',
      url: url,
      success: function (data) {
        // 
        var lrcData = data.split('\n[');
        // 
        
        // var lrcs = [];
        for (var i = 0; i < lrcData.length; i++) {
          
          var currentLrc = lrcData[i].split(']');

          if (i == 0) {
            currentLrc[0] = currentLrc[0].replace('[', '');
          }

          if (i == lrcData.length - 1) {
            currentLrc[1] = currentLrc[1].trim();
          }


          if (currentLrc[1] == '') {
            continue;
          }

          //将时间转换为秒
          var times = currentLrc[0].split(':');
          var minute = parseFloat(times[0]);
          var second = parseFloat(times[1]);

          //创建li
          var $li = $('<li class="' + (i == 4 ? 'opacity' : '') + '" data-time="' + Number((minute * 60 + second).toFixed(2))+'"><span>' + currentLrc[1] + '</span></li>');

          $('.song-word-list').append($li);


        }

      },
      error: function (err) {
        
      }
    })
  }

  //当音频播放时
  audio.onplay = function () {

    //当前歌曲首次播放
    if (isFirstPlay) {
      //获取音频总时间
      duration = this.duration;
      
      isFirstPlay = false;

      var t = formatTime(duration);
      $('#du').text(t);

      //获取最近播放歌曲
      var recentSong = JSON.parse(localStorage.getItem('recentSong'));

      //获取播放的给歌曲id
      var songId = $('#play-pause').attr('name');

      //判断当前歌曲是否被收藏
      var isHas = false;
      var likeSong = JSON.parse(localStorage.getItem('likeSong'));
      // 
      $.each(likeSong, function () {
        if (this.id == songId) {
          
          isHas = true;
          $('.collection>img').attr('src', like_active);
          return false;
        }
      })

      if (!isHas) {
        $('.collection>img').attr('src', like1);
      }

      $('.song-word-list').empty().css({
        top: '200px'
      })

      moveIndex = 0;

      //获取歌词
      var songLrcUrl = $('.song-list-item.active').eq(0).data('lrc');
      // 
      getSongWord(songLrcUrl);
      for (var i = 0; i < recentSong.length; i++) {
        if (recentSong[i].id == songId) {
          //如果存在，则不添加到最近播放列表中
          return;
        }
      }

      //根据歌曲id查询歌曲信息
      $.each(defaltSongs, function () {
        if (this.id == songId) {
          recentSong.push(this);
          localStorage.setItem('recentSong', JSON.stringify(recentSong));
        }
      })

    }

    //执行滑块的散光
    $('.mask').addClass('play');

    //尚未播放完成
    // isEnd = false;

  }

  //当音频停止时
  audio.onpause = function () {
    //停止滑块的散光
    $('.mask').removeClass('play');
  }

  //当音频播放时间发生改变时，假如现在播放时间为16.45s
  var moveIndex = 0;
  audio.ontimeupdate = function () {

    //鼠标是否按下，如果是，直接拦截
    if (isDown) {
      return;
    }

    //获取音频当前播放时间
    var currentTime = this.currentTime;

    var ct = formatTime(currentTime);

    $('#cu').text(ct);

    //获取进度百分比
    var percent = currentTime / duration;

    //移动滑块
    $('.mask').css({
      left: maxLeft * percent + 'px'
    })

    //改变激活层宽度
    $('.progress-active').css({
      width: progressWidth * percent + 'px'
    })

    //移动歌词
    var $lis = $('.song-word-list>li');
    // 

    for (var i = moveIndex; i < $lis.length; i++) {

       //获取当前li的data-time
       var currentLiTime = $($lis[i]).data('time');
      //  

      //  
 
       if (currentLiTime > currentTime) {
        //  
         break;
       }

       //获取下一个li的data-time
       var nextLiTime = $($lis[i]).next().data('time');
       
       //判断nextLiTime是否存在，如果不存在则赋值最大值
       nextLiTime = nextLiTime === undefined ? Number.MAX_VALUE : nextLiTime;

      //  

      if (currentLiTime <= currentTime && nextLiTime > currentTime) {
        // 

        //播放当前一句歌词
        //获取当前歌词的top
        var $songWordList = $('.song-word-list');
        var top = $songWordList.position().top;
        // 
        $songWordList.animate({
          top: top - 40
        }, 150)

        //获取当前li宽度，span的宽度
        var liWidth = $($lis[i]).width();
        var spanWidth = $($lis[i]).find('span').width();
        // 
        // 

        if (spanWidth > liWidth) {
          $($lis[i]).find('span').animate({
            left: -(spanWidth - liWidth) + 'px'
          }, 100)

        }

         //获取上一个节点
         var $parents = $($lis[i]).parents('.song-word-list');
         var $now = $parents.find('.now');
         var prevLiWidth = $now.removeClass('now').width();

         var prevSpanWidth = $now.find('span').width();
         if (prevSpanWidth > prevLiWidth) {
          $now.find('span').find('span').css({
            left: - (prevSpanWidth - prevLiWidth) + 'px'
          })
         }

         $($lis[i]).addClass('now').siblings().removeClass('opacity');

         //设置上下行的透明
         if (i - 4 >= 0) {
           //上一行
           $lis.eq(i - 4).addClass('opacity');

         }

         if (i + 5 <= $lis.length - 1) {
           //下一行
           $lis.eq(i + 5).addClass('opacity');
         }

        moveIndex = i + 1;

        break;
      }


    }


  }

  //鼠标松开时
  var isLeave = false;

  //鼠标按钮下时
  var isDown = false;

  // 改变进度条
  function changeProgress(e) {
    //获取相对目标元素的鼠标坐标
    var x = e.offsetX;
    // 

    //让鼠标在滑块中间位置
    var left = x - maskWidth / 2;

    //控制left的范围
    left = left > maxLeft ? maxLeft : left < minLeft ? minLeft : left;

    //移动mask
    $('.mask').css({
      left: left + 'px'
    })

    //设置激活进度条的宽度
    $('.progress-active').css({
      width: x + 'px'
    })

    var audioTime = left / maxLeft * duration;
    
    

    if (isLeave) {
      //修改音频的播放进度
      audio.currentTime = audioTime;
      isLeave = false;
    }

    if (!isDown) {
      

      var $lis = $('.song-word-list>li');


      $lis.each(function (i) {

        //获取当前li的data-time
        var currentLiTime = $(this).data('time');
        

        

        //如果是一个且第一个的时间大于当前音频播放时间，则返回第一个li
        if (i == 0 && currentLiTime > audioTime) {
          moveIndex = 0;
          $('.song-word-list').css({
            top: 200 + 'px'
          })
          $(this).siblings().removeClass('now');
          return false;
        }

        //获取下一个li的data-time
        var nextLiTime = $(this).next().data('time');
        

        if (currentLiTime <= audioTime && nextLiTime > audioTime) {
          moveIndex = i;
          
          $('.song-word-list').css({
            top: 200 - i * 40 + 'px'
          })
          $(this).addClass('now').siblings().removeClass('now');
          return false;
        }

      })

    }

  }


  //绑定事件层
  //鼠标按下
  $('.layer').on('mousedown', function (e) {
    isDown = true;
    changeProgress(e);


    //鼠标移动
    $(this).on('mousemove', function (evt) {
      //阻止浏览器默认行为
      evt.preventDefault();

      changeProgress(evt);

    })

  })

  //鼠标松开
  $('.layer').on('mouseup', function (e) {
    //解绑mousemove事件
    $(this).off('mousemove');

    isLeave = true;
    isDown = false;
    changeProgress(e);
  })

  //鼠标离开时
  $('.layer').on('mouseleave', function (e) {
    if (isDown) {
      //解绑mousemove事件
      $(this).off('mousemove');

      isLeave = true;
      isDown = false;
      changeProgress(e);
    }

  })


  //当前音频可以播放时
  audio.oncanplay = function () {

    

    //播放
    this.play();

    //修改暂停、播放状态
    $('#play-pause').data('play', 1).css({
      backgroundImage: 'url("' + playImg + '")'
    })


    //记录激活的列表的id
    var id = $('.song-list-item.active:not(:hidden)').attr('id');
    $('#play-pause').attr('name', id);

    //设置歌手和歌名
    var sn = $('.song-list-item.active:not(:hidden)').find('.name').text();
    $('.singer-name').text(sn);

    //首次播放
    // isFirstPlay = true;

  }


  //保存音乐歌单(热门歌曲列表)
  var defaltSongs = null;

  //热门歌曲列表加载歌曲数量
  var countDatas = {};
  countDatas.hotCount = {
    start: 0,
    count: 20
  };

  //最近播放歌曲列表加载歌曲数量
  countDatas.recentCount = {
    start: 0,
    count: 15
  };

  //最近播放歌曲列表加载歌曲数量
  countDatas.likeCount = {
    start: 0,
    count: 20
  };

  //创建歌曲列表
  function createSongList(data, countData) {
    //每次截取20条数据
    var songData = null;
    if (countData) {
      songData = data.slice(countData.start, countData.count + countData.start);
      countData.start += countData.count;
    } else {
      songData = data;
    }

    

    var dataIndex = $('.aside-nav>div.active').data('index');

    //获取收藏歌曲数据
    var likeSong = JSON.parse(localStorage.getItem('likeSong'));

    //生成默认列表数据
    $.each(songData, function () {

      var self = this;

      //当前歌曲是否被收藏
      var isHas = false;

      //获取当前歌曲id到likeSong查询收藏歌曲
      $.each(likeSong, function () {

        //如果id匹配，则表明该歌曲已经被收藏
        if (this.id == self.id) {
          isHas = true;
          return false;
        }
      })

      var $item = $(`<div id="${this.id}" class="song-list-item" data-url="${this.url}" data-lrc="${this.lrc}" data-songid="${this.id}">
          <div class="singer-img">
            <img class="auto-img" src="${this.pic}" alt="" />
          </div>
          <div class="song-info">
            <div class="name">${this.singer}-${this.name}</div>
            <div class="time1">
              <div class="t">${formatTime(this.time)}</div>
              <div class="icons">
                <span class="like ${dataIndex == 'likeSong' ? 'not' : ''}" data-like="${isHas ? 1 : 0}">
                  <img class="auto-img" src="${isHas ? like_active : like}" />
                </span>
                <span class="delete ${dataIndex == 'hotSong' ? 'not' : ''}">
                  <img class="auto-img" src="${deleteImg}" />
                </span>
              </div>
            </div>
          </div>
        </div>`);

      

      $('.song-list>#' + dataIndex).append($item);

    })


    //将热门歌曲缓存
    localStorage.setItem('hotSong', JSON.stringify(defaltSongs));
  }

  //初始化热门歌曲列表
  function initDefaultSongList() {

    //判断是否存在热门歌曲缓存
    var hotSong = localStorage.getItem('hotSong');
    if (hotSong) {
      defaltSongs = JSON.parse(hotSong);
      createSongList(defaltSongs, countDatas.hotCount);
      
      return;
    }

    //发起ajax请求
    $.ajax({
      //请求类型
      type: 'GET',
      //请求地址
      url: 'https://v1.itooi.cn/netease/songList',

      // 请求参数
      data: {
        id: 141998290,
        format: 1
      },

      //请求成功后执行的回调函数
      success: function (data) {
        //data: 服务器响应的数据
        // 

        //保存音乐歌单
        defaltSongs = data.data.concat();

        createSongList(defaltSongs, countDatas.hotCount);
      }
    })
  }

  initDefaultSongList();

  //绑定歌曲列表事件
  $('.song-list').on('click', '.song-list-item', function () {

    //判断当前是否激活
    if ($(this).hasClass('active')) {

      var $playPause = $('#play-pause');

      //暂停或者播放
      var status = $playPause.data('play');

      if (status == 0) {
        audio.play();
        $playPause.data('play', 1).css({
          backgroundImage: 'url("' + playImg + '")'
        })
      } else {
        audio.pause();
        $playPause.data('play', 0).css({
          backgroundImage: 'url("' + pauseImg + '")'
        })
      }


      return;
    }

    //激活当前
    $(this).addClass('active').siblings().removeClass('active');

    //移除其他隐藏歌曲列表的歌曲激活状态
    $('.song-list-item.active:hidden').removeClass('active');

    //获取歌曲id
    var songId = $(this).attr('id');

    $('[data-songid="' + songId + '"]:not(.active)').addClass('active');

    //播放歌曲
    //获取音频地址
    var audioUrl = $(this).data('url');

    $(audio).attr('src', audioUrl);

    //首次播放
    isFirstPlay = true;

  })

  //切换模式
  var modes = [{
      name: 0,
      title: '列表循环',
      url: modeIcons.liebiao
    },
    {
      name: 1,
      title: '随机播放',
      url: modeIcons.random
    },
    {
      name: 2,
      title: '单曲循环',
      url: modeIcons.danqu_32
    }
  ];

  var baseUrl = './images/';

  $('#mode').on('click', function () {

    //获取name
    var name = $(this).attr('name');

    //目前是单曲循环
    if (name == modes.length - 1) {
      //列表循环
      name = 0;
    } else {
      name++;
    }

    //获取下一个播放模式
    var nextMode = modes[name];

    $(this).attr('name', nextMode.name).attr('title', nextMode.title).find('img').attr('src', nextMode.url);

    // 

  })

  //切换侧边栏标签
  $('.aside-nav>div').on('click', function () {
    if ($(this).hasClass('active')) {
      return;
    }

    $(this).addClass('active').siblings().removeClass('active');

    //获取dataIndex
    var dataIndex = $(this).data('index');
    // 

    //根据dataIndex获取歌曲数据
    var currentSongData = JSON.parse(localStorage.getItem(dataIndex));

    // 

    //获取截取歌曲数量标识
    var currentSongCount = $(this).data('count');

    // 

    //获取当前歌曲列表歌曲数量
    var counts = $('#' + dataIndex + '>.song-list-item').length;
    // 

    //排除创建热门歌曲
    if (currentSongCount != 'hotCount') {

      createSongList(currentSongData.slice(counts));

      var songId = $('.song-list-item.active').eq(0).attr('id');

      

      $('[data-songid="' + songId + '"]:not(.active)').addClass('active');

    }
  
    //显示或者应歌曲列表
    $('#' + dataIndex).addClass('show').siblings().removeClass('show');
  })

  //收藏或者取消收藏歌曲
  $('.song-list').on('click', '.like', function (e) {
    //阻止事件冒泡
    e.stopPropagation();

    //0: 没有收藏，1：已经收藏
    var dataLike = $(this).data('like');

    // 

    //获取歌曲id
    var songId = $(this).parents('.song-list-item').attr('id');
    // 

    //获取收藏歌曲
    var likeSong = JSON.parse(localStorage.getItem('likeSong'));

    //获取热门歌曲、最近播放、收藏歌曲
    var $songLikes = $('.song-list-item[data-songid="' + songId + '"]');

    // 

    //获取正在播放歌曲的id
    var playingSongId = $('#play-pause').attr('name');

    if (dataLike == 0) {
      //收藏
      // $(this).data('like', 1).find('img').attr('src', baseUrl + 'like_active.png');

      //通过歌曲id查询歌曲
      //热门歌曲
      //最近播放
      $songLikes.each(function () {
        // var like = $(this).find('.like').data('like');

        $(this).find('.like').data('like', 1).find('img').attr('src', like_active);
       
      })


      $.each(defaltSongs, function () {
        if (this.id == songId) {

          likeSong.push(this);

          localStorage.setItem('likeSong', JSON.stringify(likeSong));

          //找到立即终止循环
          return false;
        }
      })


      if (playingSongId == songId) {
        $('.collection>img').attr('src', like_active);
      }

    } else {
      //取消收藏

      $songLikes.each(function () {

        $(this).find('.like').data('like', 0).find('img').attr('src', like);
       
      })

      //根据歌曲id删除歌曲
      for (var i = 0; i < likeSong.length; i++) {
        if (songId == likeSong[i].id) {

          //删除本地存储的收藏歌曲数据
          likeSong.splice(i, 1);

          localStorage.setItem('likeSong', JSON.stringify(likeSong));

          //删除页面收藏列表数据
          $('#likeSong>[data-songid="' + songId + '"]').remove();

          break;
        }
      }


      if (playingSongId == songId) {
        $('.collection>img').attr('src', like1);
      }

    }

    

  })

  //删除最近播放歌曲
  $('#recentSong').on('click', '.delete', function (e) {
    //阻止事件冒泡
    e.stopPropagation();
    
    //删除当前歌曲
    //获取父元素
    var deleteParents = $(this).parents('.song-list-item');

    var songId = deleteParents.attr('id');

    deleteParents.remove();

    //删除本地存储最近播放歌曲数据
    var recentSong = JSON.parse(localStorage.getItem('recentSong'));

    $.each(recentSong, function (i) {
      if (this.id == songId) {
        recentSong.splice(i, 1);
        localStorage.setItem('recentSong', JSON.stringify(recentSong));
        return false;
      }
    })


  })


  //删除我的收藏
  $('#likeSong').on('click', '.delete', function (e) {
    e.stopPropagation();
    
     //获取父元素
     var parents = $(this).parents('.song-list-item');

     //获取歌曲id
     var songId = parents.attr('id');

    //删除页面我的收藏歌曲列表
    parents.remove();


    //删除本地存储的收藏歌曲数据
    var likeSong = JSON.parse(localStorage.getItem('likeSong'));

    $.each(likeSong, function (i) {
      if (this.id == songId) {
        likeSong.splice(i, 1);
        localStorage.setItem('likeSong', JSON.stringify(likeSong));
        return false;
      }
    })

    //移除最近播放以及热门歌曲收藏显示
    $('.song-list-item[data-songid="' + songId + '"]').find('.like').data('like', 0).find('img').attr('src', like);


    $('.collection>img').attr('src', like1);
    

  })


  //音乐控制条的收藏事件
  $('.collection').on('click', function () {
    //获取当前播放歌曲id
    var songId = $('#play-pause').attr('name');

    if (!songId) {
      
      return;
    }

    //获取本地存储的收藏歌曲数据
    var likeSong = JSON.parse(localStorage.getItem('likeSong'));

    for (var i = 0; i < likeSong.length; i++) {

      if (songId == likeSong[i].id) {
        //目前歌曲已经被收藏，则需要取消收藏
        $('#likeSong>.song-list-item.active').remove();
        likeSong.splice(i, 1);
        localStorage.setItem('likeSong', JSON.stringify(likeSong));
        $(this).find('img').attr('src', like1);

        //移除热门歌曲、最近播放的收藏

        var $likes = $('.song-list-item.active').find('.like');

        // 

        $likes.data('like', 0).find('img').attr('src', like);

        return;
      }

    }

    //收藏歌曲
    var $songActive = $('.song-list-item.active');
    

    $songActive.find('.like').data('like', 1).find('img').attr('src', like_active);

    $(this).find('img').attr('src', like_active);

    //保存收藏歌曲数据
    //获取所有歌曲
    var hotSong = JSON.parse(localStorage.getItem('hotSong'));

    //根据歌曲id查询歌曲
    $.each(hotSong, function () {

      if (songId == this.id) {
        likeSong.push(this);
        localStorage.setItem('likeSong', JSON.stringify(likeSong));

        //判断当前是否显示我的收藏列表
        if (!$('#likeSong').is(':hidden')) {
          //如果是显示，实时更新我的收藏列表
          
          var $item = $(`<div id="${this.id}" class="song-list-item" data-url="${this.url}" data-lrc="${this.lrc}" data-songid="${this.id}">
              <div class="singer-img">
                <img class="auto-img" src="${this.pic}" alt="" />
              </div>
              <div class="song-info">
                <div class="name">${this.singer}-${this.name}</div>
                <div class="time1">
                  <div class="t">${formatTime(this.time)}</div>
                  <div class="icons">
                    <span class="like not" data-like="1">
                      <img class="auto-img" src="${like_active}" />
                    </span>
                    <span class="delete">
                      <img class="auto-img" src="${deleteImg}" />
                    </span>
                  </div>
                </div>
              </div>
            </div>`);

            $('#likeSong').append($item);

        }

        return false;
      }

    })


  })

  //滚动加载热门歌曲
  var timers = [];
  var songListHeight = $('.song-list').height();

  $('#hotSong').on('scroll', function () {

    var self = this;

    var timer = setTimeout(function () {

      //清除后续定时器
      for (var i = 1; i < timers.length; i++) {
        clearTimeout(timers[i]);
      }

      timers = [];

      //获取当前的滚动距离
      var scrollTop = $(self).scrollTop();
      // 

      //获取当前所有热门歌曲列表的总高度
      var $allLis = $(self).find('.song-list-item');

      var allLisHeight = $allLis.eq(0).outerHeight() * $allLis.length;

      if (songListHeight + scrollTop >= allLisHeight) {
        
        createSongList(defaltSongs, countDatas.hotCount);
      }

    }, 550)

    //将当前定时器的序号保存在timers
    timers.push(timer);
    
  })

})