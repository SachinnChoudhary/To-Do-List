from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Task model (represents the task in the database)
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(20), nullable=True)
    due_date = db.Column(db.String(20), nullable=True)

# Create the database if it doesn't exist
with app.app_context():
    db.create_all()

# Home page
@app.route('/')
def index():
    tasks = get_all_tasks()
    return render_template('index.html', tasks=tasks)

# Add a new task
@app.route('/add_task', methods=['POST'])
def add_task():
    data = request.json
    task_description = data.get('task')
    priority = data.get('priority')
    due_date = data.get('due_date')

    if task_description:
        new_task = Task(task=task_description, priority=priority, due_date=due_date)
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task added!', 'tasks': get_all_tasks()}), 200
    return jsonify({'message': 'Invalid task'}), 400

# Delete a task
@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task_to_delete = Task.query.get(task_id)
    if task_to_delete:
        db.session.delete(task_to_delete)
        db.session.commit()
        return jsonify({'message': 'Task deleted!', 'tasks': get_all_tasks()}), 200
    return jsonify({'message': 'Task not found'}), 404

# Toggle task completion
@app.route('/toggle_complete/<int:task_id>', methods=['POST'])
def toggle_complete(task_id):
    task = Task.query.get(task_id)
    if task:
        task.completed = not task.completed
        db.session.commit()
        return jsonify({'message': 'Task status updated!', 'tasks': get_all_tasks()}), 200
    return jsonify({'message': 'Task not found'}), 404

# Get all tasks
def get_all_tasks():
    tasks = Task.query.all()
    return [{'id': task.id, 'task': task.task, 'completed': task.completed, 'priority': task.priority, 'due_date': task.due_date} for task in tasks]

# Filter tasks by completion status
@app.route('/filter_tasks/<string:status>', methods=['GET'])
def filter_tasks(status):
    if status == 'completed':
        tasks = Task.query.filter_by(completed=True).all()
    elif status == 'incomplete':
        tasks = Task.query.filter_by(completed=False).all()
    else:
        tasks = Task.query.all()

    return jsonify([{'id': task.id, 'task': task.task, 'completed': task.completed, 'priority': task.priority, 'due_date': task.due_date} for task in tasks])

# Sort tasks by priority
@app.route('/sort_tasks', methods=['GET'])
def sort_tasks():
    tasks = Task.query.order_by(Task.priority).all()
    return jsonify([{'id': task.id, 'task': task.task, 'completed': task.completed, 'priority': task.priority, 'due_date': task.due_date} for task in tasks])

# Search tasks by description
@app.route('/search_task', methods=['GET'])
def search_task():
    search_query = request.args.get('q')
    tasks = Task.query.filter(Task.task.like(f"%{search_query}%")).all()
    return jsonify([{'id': task.id, 'task': task.task, 'completed': task.completed, 'priority': task.priority, 'due_date': task.due_date} for task in tasks])

if __name__ == '__main__':
    app.run(debug=True)
