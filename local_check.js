var { PrismaClient } = require("@prisma/client");
var prisma = new PrismaClient();
async function check(){
  var a = await prisma.article.count();
  var c = await prisma.category.count();
  console.log("Lokal Haber:", a);
  console.log("Lokal Kategori:", c);
  var latest = await prisma.article.findMany({take:3, orderBy:{createdAt:"desc"}, select:{title:true,status:true}});
  latest.forEach(function(r,i){ console.log((i+1)+". ["+r.status+"] "+r.title); });
  await prisma.$disconnect();
}
check().catch(console.error);
