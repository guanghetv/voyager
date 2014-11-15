module.exports = function(engine){
  engine.filter('AnswerProblem', function(track, callback){
    var _ = engine._;
    var a = engine.filterAttribute(track, [
      'ChapterId' ,
      'LessonId',
      'timestamp',
      'Correct',
      'ThinkTime',
      'Answer',
      'CheckExplanationOrNot',
      'isReview'
    ]);
    if(a){
      engine.cache.hget('chapter:' + track.ChapterId, 'lesson:' + track.LessonId, function(err, str){
        var lesson = JSON.parse(str);
        if(!lesson) return callback('lesson is null');
        var problems = _.flatten(_.map(lesson.activities, function(activitiy){
          return activitiy.problems;
        }));
        if('ProblemId' in track){
          var problem = _.find(problems, function(problem){
            return track.ProblemId;
          });
          if(problem){
            switch(problem.type){
              case 'singlechoice':
                a.Answer = _.findWhere(problem.choices, function(choice){
                  return choice.body == a.Answer;
                })._id;
                break;
              case 'multichoice'://多选题数据有问题 ？
                var choice = _.findWhere(problem.choices, function(choice){
                  return choice.body == a.Answer;
                });
                if(choice){
                  a.Answer = [ choice._id ] ;
                }
                break;
              case 'singlefilling':
                //nothing.
                break;
            }
          }
        }
        // console.log(a.Answer);
        callback(err, a);
      });
    }else{
      callback('track 无效');
    }
  });
};
