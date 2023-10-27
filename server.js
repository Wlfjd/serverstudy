//express 라이브러리 사용법
const express = require('express')
const app=express()

app.use(express.static(__dirname+'public'))
const { MongoClient } = require('mongodb')

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
app.get('/',(require,response)=>{
    response.sendFile(__dirname+'/index.html')
})
//news 페이지 만들기
app.get('/news',(require,response)=>{
    db.collection('post').insertOne({title:'가나다'})
    // response.send('sunny day')
})
app.get('/shop',(require,response)=>{
    response.send('shopping page')
})