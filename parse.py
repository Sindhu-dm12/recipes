from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import json
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///recipes.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
class Recipe(db.Model):
    __tablename__  = "recipes"
    id = db.Column(db.Integer,primary_key = True,autoincrement=True)
    title = db.Column(db.String)
    cuisine=db.Column(db.String)
    rating=db.Column(db.Float)
    prep_time=db.Column(db.String)
    cook_time=db.Column(db.String)
    total_time=db.Column(db.String)
    description=db.Column(db.Text)
    nutrients=db.Column(db.Text)
    serves=db.Column(db.String)
    
with app.app_context():
    db.create_all()

def parse(filename):
    with open(filename,"r") as f:
         data = json.load(f)
    batch =[] 
    for recipe_id, recipe in data.items():
        try:
            nutrient = json.dumps(recipe.get("nutrients",{}))
            batch.append(Recipe(
            cuisine=recipe.get("cuisine") or None,
            title=recipe.get("title") or None,
            rating=recipe.get("rating") or None,
            prep_time = recipe.get("prep_time") or None,
            cook_time = recipe.get("cook_time") or None,
            total_time = recipe.get("total_time") or None,
            description = recipe.get("description") or None,
            nutrients = nutrient,
            serves = recipe.get("serves") or None
            ))
            if len(batch) >= 5000:
                with app.app_context():
                    db.session.add_all(batch)
                    db.session.commit()
                batch=[]  
        except Exception as e:
            print(f"{e}")
    if batch:
        with app.app_context():
            db.session.add_all(batch)
            db.session.commit()
        print("Insertion Done") 
parse("US_recipes_null.json")   