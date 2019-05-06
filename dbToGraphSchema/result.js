module.exports = function(db){
const { GraphQLServer } = require('graphql-yoga')
const typeDefs=`
type Query { 
  Duyurular:[Duyurular]
  KullaniciBildirimTalepleri:[Kullanici_Bildirim_Talepleri]
  KullaniciKonuBildirimleri:[Kullanici_Konu_Bildirimleri]
  Kullanicilar:[Kullanicilar]
  SabitSecimVerileri:[Sabit_Secim_Verileri]
  Sayfalar:[Sayfalar]
  Tasarimlar:[Tasarimlar]
  YetkiGruplari:[Yetki_Gruplari]
  test:[test]
}
type Duyurular{
  User: String 
  When: String 
  _id: String 
  color: String 
  date: String 
  text: String 
  title: String 
}
type Kullanici_Bildirim_Talepleri{
  User: String 
  When: String 
  _id: String 
  topics: String 
  user: String 
}
type Kullanici_Konu_Bildirimleri{
  When: String 
  _id: String 
  desginKey: String 
  link: String 
  readed: String 
  text: String 
  topic: String 
  user: String 
}
type Kullanicilar{
  User: String 
  When: String 
  _id: String 
  create: String 
  delete: String 
  gender: String 
  grup: String 
  password: String 
  update: String 
  userName: String 
}
type Sabit_Secim_Verileri{
  User: String 
  When: String 
  _id: String 
  content: String 
  name: String 
}
type Sayfalar{
  User: String 
  When: String 
  _id: String 
  collection: String 
  content: String 
  icon: String 
  link: String 
  pageName: String 
  showMenu: String 
}
type Tasarimlar{
  User: String 
  When: String 
  _id: String 
  icon: String 
  key: String 
  text: String 
  title: String 
}
type Yetki_Gruplari{
  User: String 
  When: String 
  _id: String 
  allowedCollection: String 
  name: String 
}
type test{
  User: String 
  When: String 
  _id: String 
  dddd: String 
  ee: String 
  keya: String 
  keyb: String 
  keyc: String 
  q: String 
}`
const resolvers= { 
 Query: { 
      Duyurular:async ()=>await db.collection('Duyurular').find().toArray() ,
      KullaniciBildirimTalepleri:async ()=>await db.collection('Kullanıcı Bildirim Talepleri').find().toArray() ,
      KullaniciKonuBildirimleri:async ()=>await db.collection('Kullanıcı Konu Bildirimleri').find().toArray() ,
      Kullanicilar:async ()=>await db.collection('Kullanıcılar').find().toArray() ,
      SabitSecimVerileri:async ()=>await db.collection('Sabit Seçim Verileri').find().toArray() ,
      Sayfalar:async ()=>await db.collection('Sayfalar').find().toArray() ,
      Tasarimlar:async ()=>await db.collection('Tasarımlar').find().toArray() ,
      YetkiGruplari:async ()=>await db.collection('Yetki Grupları').find().toArray() ,
      test:async ()=>await db.collection('test').find().toArray() ,
}
  };
const graphQLserver = new GraphQLServer({ typeDefs, resolvers })
graphQLserver.start({port:3001},() => console.log('GraphQLServer ready..'))
}