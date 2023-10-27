//express 라이브러리 사용법
const express = require('express')
const app=express()

app.use(express.static(__dirname+'public'))

//서버 띄우는 코드 app.listen(포트번호) = 내 컴퓨터 PORT 하나 오픈
app.listen(8080,()=>{
    console.log('http://localhost:8080 에서 서버 실행중')
})

//서버 기능 - 메인페이지 접속 시 hello를 유저에게 보내기
app.get('/',(require,response)=>{
    response.sendFile(__dirname+'/index.html')
})
//news 페이지 만들기
app.get('/news',(require,response)=>{
    response.send('sunny day')
})
app.get('/shop',(require,response)=>{
    response.send('shopping page')
})