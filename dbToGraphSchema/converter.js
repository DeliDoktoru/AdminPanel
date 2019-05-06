String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.findAndReplace= function(){
    return  this.replaceAll("ı","i").
    replaceAll("ü","u").
    replaceAll("ö","o").
    replaceAll("İ","I").
    replaceAll("Ö","O").
    replaceAll("Ü","U").
    replaceAll("ç","c").
    replaceAll("ş","s").
    replaceAll("Ç","C").
    replaceAll("Ş","S");
}
var fs = require('fs')
  , filename = "result.json";
fs.readFile(filename, 'utf8', function(err, data) {
    if (err) throw err;
    for(i=0;i<2;i++){
        if(data.lastIndexOf("\n")>0) {
            data = data.substring(0, data.lastIndexOf("\n"));
        } 
    }
    data = JSON.parse(data.split("\n").slice(4).join("\n"));
    var txt="module.exports = function(db){\n"
    txt+="const { GraphQLServer } = require('graphql-yoga')\n"
    txt+="const typeDefs=`\ntype Query { \n";
    for(item of data){
        item.name=item.dbName.replaceAll(" ","_").findAndReplace();
        item.nName=item.dbName.replaceAll(" ","").findAndReplace();
        txt+="  "+item.nName+":["+item.name+"]\n";
    }
    txt+="}";
    for(item of data){
        txt+="\ntype "+item.name+"{\n"
        for(field of item.fields){
            txt+="  "+field+": String \n"
        }
        txt+="}";
    }
    txt+="`\n";
    txt+="const resolvers= { \n Query: { \n";
    for(item of data){
        txt+="      "+item.nName+":async ()=>await db.collection('"+item.dbName+"').find().toArray() ,\n"
    }
    txt+="}\n  };\n";
    txt+= "const graphQLserver = new GraphQLServer({ typeDefs, resolvers })\n"
    txt+="graphQLserver.start({port:3001},() => console.log('GraphQLServer ready..'))\n"
    txt+="}";
    var fs1 = require('fs');
    fs1.writeFile('result.js', txt, function (err) {
        if (err) throw err;
    });
});