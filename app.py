from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc
import json
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///recipes.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Recipe(db.Model):
    __tablename__ = "recipes"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String)
    cuisine = db.Column(db.String)
    rating = db.Column(db.Float)
    prep_time = db.Column(db.Integer)
    cook_time = db.Column(db.Integer)
    total_time = db.Column(db.Integer)
    description = db.Column(db.Text)
    nutrients = db.Column(db.Text)
    serves = db.Column(db.String)


@app.route("/api/recipes", methods=["GET"])
def first():
    try:
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 15, type=int)
        query = Recipe.query.order_by(desc(Recipe.rating))
        pagination = query.paginate(page=page, per_page=limit)
        recipes = []
        for i in pagination.items:
            recipes.append({
                "id": i.id,
                "title": i.title,
                "cuisine": i.cuisine,
                "rating": i.rating,
                "prep_time": i.prep_time,
                "cook_time": i.cook_time,
                "total_time": i.total_time,
                "description": i.description,
                "nutrients": json.loads(i.nutrients) if i.nutrients else {},
                "serves": i.serves
            })
        return jsonify({
            "page": page,
            "limit": limit,
            "total": pagination.total,
            "data": recipes
        })
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/api/recipes/search")
def api():
    try:
        calories = request.args.get("calories", type=str)
        title = request.args.get("title", type=str)
        cuisine = request.args.get("cuisine", type=str)
        total_time = request.args.get("total_time", type=str)
        rating = request.args.get("rating", type=str)

        query = Recipe.query

        if cuisine:
            query = query.filter(Recipe.cuisine.ilike(f"%{cuisine}%"))
        if title:
            query = query.filter(Recipe.title.ilike(f"%{title}%"))

        if total_time:
            val = re.match(r"(<=|<|>=|>|=)(\d+)", total_time.strip())
            if val:
                operator, value = val.groups()
                value = int(value)
                if operator == "=":
                    query = query.filter(Recipe.total_time == value)
                elif operator == "<=":
                    query = query.filter(Recipe.total_time <= value)
                elif operator == ">=":
                    query = query.filter(Recipe.total_time >= value)
                elif operator == "<":
                    query = query.filter(Recipe.total_time < value)
                elif operator == ">":
                    query = query.filter(Recipe.total_time > value)

        if rating:
            val = re.match(r"(<=|>=|=|<|>)(\d+(\.\d+)?)", rating.strip())
            if val:
                operator, value, _ = val.groups()
                value = float(value)
                if operator == "=":
                    query = query.filter(Recipe.rating == value)
                elif operator == "<=":
                    query = query.filter(Recipe.rating <= value)
                elif operator == ">=":
                    query = query.filter(Recipe.rating >= value)
                elif operator == "<":
                    query = query.filter(Recipe.rating < value)
                elif operator == ">":
                    query = query.filter(Recipe.rating > value)

        all_recipes = query.all()
        results = []

        for recipe in all_recipes:
            nutrients = json.loads(recipe.nutrients) if recipe.nutrients else {}

            if calories:
                match = re.match(r"(<=|>=|=|<|>)(\d+(\.\d+)?)", calories.strip())
                if match:
                    op, value, _ = match.groups()
                    value = float(value)
                    recipe_calories = nutrients.get("calories", 0)
                    if isinstance(recipe_calories, str):
                        cal_match = re.search(r"(\d+(\.\d+)?)", recipe_calories)
                        recipe_calories = float(cal_match.group(1)) if cal_match else 0
                    if op == ">=" and recipe_calories < value: continue
                    if op == "<=" and recipe_calories > value: continue
                    if op == ">" and recipe_calories <= value: continue
                    if op == "<" and recipe_calories >= value: continue
                    if op == "=" and recipe_calories != value: continue

            results.append({
                "id": recipe.id,
                "title": recipe.title,
                "cuisine": recipe.cuisine,
                "rating": recipe.rating,
                "total_time": recipe.total_time,
                "serves": recipe.serves,
                "description": recipe.description,
                "cook_time": recipe.cook_time,
                "prep_time": recipe.prep_time,
                "nutrients": nutrients
            })

        return jsonify({"data": results})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)