//express 라이브러리 사용법
const express = require('express')
const app=express()
const { MongoClient, ObjectId } = require('mongodb')

//form 태그에서 put,delete 요청하는 방법 (ajax or 라이브러리)
const methodOverride=require('method-override')
const bcrypt = require('bcryptjs') 

app.use(methodOverride('_method'))

app.use(express.static(__dirname+'/public'))
app.set('view engine', 'ejs') 
// require.body를 해주는 세팅
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const session=require('express-session')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const MongoStore=require('connect-mongo')

app.use(passport.initialize())
app.use(session({
    //세션의 document id는 암호화해서 유저에게 보낸다
    secret:'암호화에 쓸 비밀번호',
    resave: false,// 유저가 서버로 요청할 때마다 세션 갱신할지
    saveUninitialized:false,// 로그인 안해도 세션 만들건지
    cookie:{maxAge:60*1000}, //쿠키 한시간동안 유지-> 1시간 지나면 로그아웃 됨
    store: MongoStore.create({
        mongoUrl:'mongodb+srv://wlfjd:wldnjs813!@cluster0.nohbanp.mongodb.net/?retryWrites=true&w=majority',
        dbName:'forum'
    })
}))
app.use(passport.session())

let db
const url = 'mongodb+srv://wlfjd:wldnjs813!@cluster0.nohbanp.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  //forum 데이터베이스에 연결
  db = client.db('forum')
  //자리 이동(성공해야 띄우도록)
  //서버 띄우는 코드 app.listen(포트번호) = 내 컴퓨터 PORT 하나 오픈
app.listen(8080,()=>{
    console.log('http://localhost:8080 에서 서버 실행중')
})

}).catch((err)=>{
  console.log(err)
})


//서버 기능 - 메인페이지 접속 시 hello를 유저에게 보내기
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})
//news 페이지 만들기
app.get('/news',(req,res)=>{


    db.collection('post').insertOne({title:'가나다'})
    // response.send('sunny day')
})
app.get('/list', async(req,res)=>{
    // db.collection은 실행이 오래걸리는 코드라 기다려야 함 
    //만약 비동기로 하지 않는다면 실행이 되기도 전에 다음 줄 출력
    // await 또는 .then(()=>{}) 사용
    let result= await db.collection('post').find().toArray() //모든 결과 출력하기
    //서버에서 console.log 쓰면 터미널에 출력된다
    
    //응답은 1번만
    res.render('list.ejs', { lists: result})
})


app.get('/time', (req,res)=>{
   let date=new Date()
   res.render('time.ejs',{time:date})
})

app.get('/write', (req,res)=>{
    res.render('write.ejs')
})

app.post('/add',async(req,res)=>{
// 예외처리 try-catch    
try{
    if(!req.body.title){
        res.send('입력해주세요')
    } else{ 
        await db.collection('post').insertOne({title:req.body.title,content:req.body.content})
         res.redirect('/list')}
} catch(e){
    console.log(e)
    res.status(500).send('서버 에러 ')
}})

app.get('/detail/:id', async(req,res)=>{
    // 없는 id를 입력 시 에러발생, 에러를 방지하기 위한 try,catch 문
    try{
        //<상세페이지 기능>
        //1. 유저가 detail:xx 접속하면( 상세페이지 )
        //2. {id:~} 를 db에서 찾아서
        let result= await db.collection('post').findOne({_id: new ObjectId(req.params.id)}) //하나만 찾고싶을때,  find.toArray() 는 전부 다 
       
        //3. ejs 파일에 박아서 보내준다 
        //let result= await db.collection('post').find().toArray() //모든 결과 출력하기
        res.render('detail.ejs',{details:result})

    }catch(e){
        console.log(e)
        res.status(400).send('url 주소가 잘못됨')
    }
})

app.get('/edit/:id', async(req,res)=>{
    let result= await db.collection('post').findOne({_id: new ObjectId(req.params.id)}) 
    res.render('edit.ejs',{list:result})
})

app.put('/edit', async(req,res)=>{
    // //req.body : 유저가 input에 입력한 값이 객체로{title:, content:} 들어있음 
     await db.collection('post').updateOne({_id: new ObjectId(req.body.id)},{$set :{title:req.body.title,content:req.body.content}})
     res.redirect('/list')
})


app.delete('/delete',async(req,res)=>{
    await db.collection('post').deleteOne({ _id: new ObjectId(req.query.docid) })
    console.log(req.query)
    //ajax 요청 사용 시 redirect, render 사용 안하는 것이 나음 -> 새로고침이 안되기 때문에
    res.send('삭제완료')
})

app.get('/list/:id', async(req,res)=>{
//5개 스킵하고 5개만 가져옴 => 페이지네이션
    let result= await db.collection('post').find().skip(5*(req.params-1)).limit(5).toArray() //모든 결과 출력하기
    res.render('list.ejs', { lists: result})
})

//아이디/비번이 DB와 일치하는지 검증
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({ username : 입력한아이디})
    if (!result) {
        //false : 회원인증 실패
        return cb(null, false, { message: '아이디 DB에 없음' })
    }
   
    if (result.password == 입력한비번) {
      return cb(null, result)
    } else {
      return cb(null, false, { message: '비번불일치' });
    }
  }))


  //로그인 시도할 때마다 실행하는코드 -> 로그인 여부 판단
  passport.serializeUser((user, done) => {
    console.log(user)
    // 처리보류(비동기), 가장 오래걸리는 DB 저장
    process.nextTick(() => {
        //로그인 시 세션 document 발행해주고, -> 이 id를 쿠키에 적어 보내줌
      done(null, {id: user._id, username:user.username})
    })
  })
  // 성공적으로 로그인해서 받는 유저 쿠키 분석 -> 세션 데이터랑 비교 -> 이상 없으면 로그인 정보 세팅
  passport.deserializeUser(async(user, done) => {
    let result= await db.collection('user').findOne({_id: new ObjectId(user.id)})
    delete result.password
    process.nextTick(() => {
        //로그인 시 세션 document 발행해주고, -> 이 id를 쿠키에 적어 보내줌
      
      // return 안하면 쿠키 안남음 
        return done(null, result)
    })
  })


app.get('/login', (req,res)=>{
    console.log(req.user)
    res.render('login.ejs')
})



//로그인 폼 전송 버튼 누르면 post 요청
app.post('/login', async(req,res,next)=>{
    passport.authenticate('local', (error,user,info)=>{
        if(error) return res.status(500).json(error)
        if(!user) return res.status(401).json(info.message)
        req.logIn(user,(err)=>{
            if(err) return next(err)
             res.redirect('/')
        })
    })(req,res,next)
})
app.get('/mypage', async(req,res)=>{
    console.log(req.user)
    res.render('mypage.ejs')
})
app.get('/register', async(req,res)=>{
    res.render('register.ejs')
})
app.post('/register', async(req,res)=>{

    let hash= await bcrypt.hash(req.body.password,10)
    console.log(hash)
    
    await db.collection('user').insertOne({
        username:req.body.username,
        password:hash
    })
    res.redirect('/')
})




