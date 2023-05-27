const express = require('express');
const bodyParser = require('body-parser');
const mongoose=require("mongoose");
const _=require("lodash");


const app = express();




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true});


 const listItemsSchema={
  name:String
 };

 const Item = mongoose.model("Item",listItemsSchema);
 const item1=new Item({
  name:"welcome to your todolist"
 });

 const item2=new Item({
  name:"Hit the + button to add a new item"
 });


 const item3=new Item({
  name:"<-- hit this to delete an item"
 });
 const defaultItems=[item1,item2,item3]; 
 
 const listSchema={
  name:String,
  items:[listItemsSchema]
 } ; 

 const List=mongoose.model("List",listSchema) ; 


app.get("/", function(req, res) {
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Successfully saved");
            res.redirect("/");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.render("list", {
          listTitle: "Today",
          listItems: foundItems
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});

app.get("/:customlistname", function(req, res) {
  const customlistname = _.capitalize(req.params.customlistname);

  List.findOne({ name: customlistname })
    .then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customlistname,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customlistname);
      } else {
        res.render("list", { listTitle: foundList.name, listItems: foundList.items });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});


app.get("/work", function(req, res){
  res.render("list", {
    listTitle: "Work List",
    listItems: workItems});
});


app.post("/", function(req, res) {
  const itemName = req.body.newTodo;
  const listName = req.body.listSubmit;
  const item = new Item({
    name: itemName
  });

  if (!listName || listName.toLowerCase() === "today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        if (!foundList) {
          const list = new List({
            name: customlistname,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customlistname);
          
        } else {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete",function(req,res){
const checkeditemid=req.body.checkbox; 

const listName=req.body.listName;

 if(listName === "Today"){

  Item.findByIdAndRemove(checkeditemid)
  .then(() => {
    console.log("Successfully deleted");
    res.redirect("/");
  })
  .catch((err) => {
    console.log(err);
  });

 }
 else{

  List.findOneAndUpdate(
    { name: listName },                     // Filter condition
    { $pull: { items: { _id: checkeditemid } } }  // Update operation
  )
    .then(foundList => {
      res.redirect("/" + listName);        // Redirect to a specific URL
    })
    .catch(err => {
      // Handle error
    });
  
 }

});

let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server running on port 3000.");
});