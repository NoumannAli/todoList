//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();
const mongoose = require("mongoose");
let source  = require(__dirname + "/.gitignore/ignore.js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://"+ source.userName+source.password+"@cluster0.25gm5.mongodb.net/todolistDB", {useNewUrlParser: true ,  useUnifiedTopology: true });


const itemSchema = {
  name : String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name : "<<< Check this to delete an Item"
});


 const itemsArray = [item1];

 const listSchema = {
   name : String,
   items: [itemSchema]
 };

const List = mongoose.model("List", listSchema);






app.get("/",function(req,res){

  Item.find({},function(err,foundItems){
    console.log(foundItems);

    if (foundItems.length === 0){
      Item.insertMany(itemsArray,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Items Successfully Added to the Database");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle:"Today" , newTodo: foundItems});


    }

  });




});

app.post("/",function(req,res){
   const newItem = req.body.input;
   const listName = req.body.list;

   const item = new Item({
     name : newItem
   });
   if (listName === "Today"){
     item.save();
     res.redirect("/");
   }else{
     List.findOne({name:listName},function(err,foundlist){
       foundlist.items.push(item);
       foundlist.save();
       res.redirect("/" + listName);
     });
   }



   // if(req.body.list === "Work"){
   //   workItems.push(newItem);
   //   res.redirect("/work");
   // }else{
   //   newItems.push(newItem);
   //  res.redirect("/");
   // }



});


app.post("/delete", function(req,res){
  const deleteItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    console.log(deleteItem);
   Item.findByIdAndRemove(deleteItem , function(err){
     if(!err){
       console.log("Ite  is Successfully Deleted");
       res.redirect("/");
     }

   });

 }else{
   List.findOneAndUpdate({name:listName}, {$pull: {items:{_id: deleteItem}}},function(err,foundlist){
     if(!err){
       res.redirect("/"+listName);
     }
   });
 }

});

// app.get("/work",function(req,res){
//   res.render("list",{listTitle:"Work List", newTodo: workItems});
// });
//
// app.post("/work",function(req,res){
//   const newItem = req.body.input;
//   workItems.push(newItem);
//   res.redirect("/work");
//
// });


app.get("/:customeNameList" , function(req,res){
  const customeNameList = _.capitalize(req.params.customeNameList);


  List.findOne({name:customeNameList} ,function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name : customeNameList,
          items: itemsArray


        });
        list.save();
        res.redirect("/")
      }else{
        res.render("list",{listTitle:foundlist.name , newTodo: foundlist.items} );



      }
    }

  });

});



app.get("/index",function(req,res){
  res.render("index");
});


app.listen(3000,function(){
  console.log("listening on port 3000");
});
