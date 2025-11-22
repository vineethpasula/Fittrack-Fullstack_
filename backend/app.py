from flask import Flask, request, jsonify
from flask_cors import CORS
from config import DATABASE_URI
from models import db, User, Membership, Trainer, FitnessClass, ClassRegistration, WorkoutLog, Payment

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

@app.route("/")
def home():
    return jsonify({
        "message": "FitTrack API is running",
        "endpoints": [
            "/api/health",
            "/api/login",
            "/api/dashboard-stats",
            "/api/classes"
        ]
    }), 200

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/api/debug-users")
def debug_users():
    users = User.query.all()
    return jsonify([
        {"id": u.user_id, "email": u.email, "role": u.role}
        for u in users
    ])



# ---------- AUTH ----------

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or user.password_hash != password:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user.user_id,
        "role": user.role,
        "email": user.email
    }), 200



# ---------- DASHBOARD STATS + CHART DATA ----------

@app.route("/api/dashboard-stats", methods=["GET"])
def dashboard_stats():
    total_users = User.query.count()
    total_memberships = Membership.query.count()
    total_classes = FitnessClass.query.count()
    total_payments = db.session.query(db.func.sum(Payment.amount)).scalar() or 0.0

    plan_counts = db.session.query(
        Membership.plan_type,
        db.func.count(Membership.membership_id)
    ).group_by(Membership.plan_type).all()

    plans = [p[0] for p in plan_counts]
    counts = [p[1] for p in plan_counts]

    return jsonify({
        "summary": {
            "total_users": total_users,
            "total_memberships": total_memberships,
            "total_classes": total_classes,
            "total_payments": total_payments
        },
        "plan_chart": {
            "labels": plans,
            "data": counts
        }
    })


# ---------- CLASSES CRUD ----------

@app.route("/api/classes", methods=["GET"])
def get_classes():
    classes = FitnessClass.query.all()
    result = []
    for c in classes:
        trainer_name = None
        if c.trainer:
            u = User.query.get(c.trainer.user_id)
            trainer_name = f"{u.first_name} {u.last_name}" if u else None

        result.append({
            "class_id": c.class_id,
            "title": c.title,
            "description": c.description,
            "trainer_id": c.trainer_id,
            "trainer_name": trainer_name,
            "capacity": c.capacity,
            "start_time": c.start_time,
            "end_time": c.end_time,
            "location": c.location
        })
    return jsonify(result)


@app.route("/api/classes", methods=["POST"])
def create_class():
    data = request.get_json() or {}

    new_class = FitnessClass(
        title=data.get("title"),
        description=data.get("description"),
        trainer_id=data.get("trainer_id"),
        capacity=data.get("capacity"),
        start_time=data.get("start_time"),
        end_time=data.get("end_time"),
        location=data.get("location"),
    )
    db.session.add(new_class)
    db.session.commit()

    return jsonify({"message": "Class created", "class_id": new_class.class_id}), 201


@app.route("/api/classes/<int:class_id>", methods=["PUT"])
def update_class(class_id):
    data = request.get_json() or {}
    c = FitnessClass.query.get_or_404(class_id)

    c.title = data.get("title", c.title)
    c.description = data.get("description", c.description)
    c.trainer_id = data.get("trainer_id", c.trainer_id)
    c.capacity = data.get("capacity", c.capacity)
    c.start_time = data.get("start_time", c.start_time)
    c.end_time = data.get("end_time", c.end_time)
    c.location = data.get("location", c.location)

    db.session.commit()
    return jsonify({"message": "Class updated"})


@app.route("/api/classes/<int:class_id>", methods=["DELETE"])
def delete_class(class_id):
    c = FitnessClass.query.get_or_404(class_id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Class deleted"})

# ---------- MEMBERS CRUD ----------

@app.route("/api/members", methods=["GET"])
def get_members():
    users = User.query.order_by(User.user_id).all()
    return jsonify([
        {
            "user_id": u.user_id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role,
        }
        for u in users
    ])

@app.route("/api/members", methods=["POST"])
def create_member():
    data = request.get_json() or {}
    u = User(
        email=data.get("email"),
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        role=data.get("role", "member"),
        password_hash="temp123",  # for this project we don't use real passwords
        created_at="2024-01-01",
    )
    db.session.add(u)
    db.session.commit()
    return jsonify({"message": "member created", "user_id": u.user_id}), 201

@app.route("/api/members/<int:user_id>", methods=["PUT"])
def update_member(user_id):
    u = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    u.first_name = data.get("first_name", u.first_name)
    u.last_name = data.get("last_name", u.last_name)
    u.email = data.get("email", u.email)
    u.role = data.get("role", u.role)
    db.session.commit()
    return jsonify({"message": "member updated"})

@app.route("/api/members/<int:user_id>", methods=["DELETE"])
def delete_member_route(user_id):
    u = User.query.get_or_404(user_id)
    db.session.delete(u)
    db.session.commit()
    return jsonify({"message": "member deleted"})


# ---------- PAYMENTS CRUD ----------

@app.route("/api/payments", methods=["GET"])
def get_payments():
    payments = Payment.query.order_by(Payment.payment_id).all()
    return jsonify([
        {
            "payment_id": p.payment_id,
            "membership_id": p.membership_id,
            "amount": float(p.amount),
            "payment_date": p.payment_date,
            "method": p.method,
            "status": p.status,
        }
        for p in payments
    ])

@app.route("/api/payments", methods=["POST"])
def create_payment_route():
    data = request.get_json() or {}
    p = Payment(
        membership_id=data.get("membership_id"),
        amount=data.get("amount"),
        payment_date=data.get("payment_date"),
        method=data.get("method", "card"),
        status=data.get("status", "paid"),
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({"message": "payment created", "payment_id": p.payment_id}), 201

@app.route("/api/payments/<int:payment_id>", methods=["PUT"])
def update_payment_route(payment_id):
    p = Payment.query.get_or_404(payment_id)
    data = request.get_json() or {}
    p.membership_id = data.get("membership_id", p.membership_id)
    p.amount = data.get("amount", p.amount)
    p.payment_date = data.get("payment_date", p.payment_date)
    p.method = data.get("method", p.method)
    p.status = data.get("status", p.status)
    db.session.commit()
    return jsonify({"message": "payment updated"})

@app.route("/api/payments/<int:payment_id>", methods=["DELETE"])
def delete_payment_route(payment_id):
    p = Payment.query.get_or_404(payment_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "payment deleted"})

# ---------- TRAINERS CRUD ----------

@app.route("/api/trainers", methods=["GET"])
def get_trainers():
    trainers = Trainer.query.order_by(Trainer.trainer_id).all()
    result = []
    for t in trainers:
        user = User.query.get(t.user_id)
        result.append({
            "trainer_id": t.trainer_id,
            "user_id": t.user_id,
            "specialty": t.specialty,
            "experience_years": t.experience_years,
            "first_name": user.first_name if user else None,
            "last_name": user.last_name if user else None,
            "email": user.email if user else None,
        })
    return jsonify(result)


@app.route("/api/trainers", methods=["POST"])
def create_trainer():
    data = request.get_json() or {}
    t = Trainer(
        user_id=data.get("user_id"),
        specialty=data.get("specialty"),
        experience_years=data.get("experience_years"),
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({"message": "trainer created", "trainer_id": t.trainer_id}), 201


@app.route("/api/trainers/<int:trainer_id>", methods=["PUT"])
def update_trainer(trainer_id):
    t = Trainer.query.get_or_404(trainer_id)
    data = request.get_json() or {}
    t.user_id = data.get("user_id", t.user_id)
    t.specialty = data.get("specialty", t.specialty)
    t.experience_years = data.get("experience_years", t.experience_years)
    db.session.commit()
    return jsonify({"message": "trainer updated"})


@app.route("/api/trainers/<int:trainer_id>", methods=["DELETE"])
def delete_trainer(trainer_id):
    t = Trainer.query.get_or_404(trainer_id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "trainer deleted"})

# ---------- REGISTRATIONS CRUD ----------

@app.route("/api/registrations", methods=["GET"])
def get_registrations():
    regs = ClassRegistration.query.order_by(ClassRegistration.registration_id).all()
    return jsonify([
        {
            "registration_id": r.registration_id,
            "class_id": r.class_id,
            "user_id": r.user_id,
            "registered_at": r.registered_at,
            "status": r.status,
        }
        for r in regs
    ])


@app.route("/api/registrations", methods=["POST"])
def create_registration():
    data = request.get_json() or {}
    r = ClassRegistration(
        class_id=data.get("class_id"),
        user_id=data.get("user_id"),
        registered_at=data.get("registered_at"),
        status=data.get("status", "registered"),
    )
    db.session.add(r)
    db.session.commit()
    return jsonify({"message": "registration created", "registration_id": r.registration_id}), 201


@app.route("/api/registrations/<int:registration_id>", methods=["PUT"])
def update_registration(registration_id):
    r = ClassRegistration.query.get_or_404(registration_id)
    data = request.get_json() or {}
    r.class_id = data.get("class_id", r.class_id)
    r.user_id = data.get("user_id", r.user_id)
    r.registered_at = data.get("registered_at", r.registered_at)
    r.status = data.get("status", r.status)
    db.session.commit()
    return jsonify({"message": "registration updated"})


@app.route("/api/registrations/<int:registration_id>", methods=["DELETE"])
def delete_registration(registration_id):
    r = ClassRegistration.query.get_or_404(registration_id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "registration deleted"})


## ---------- WORKOUTS CRUD ----------

@app.route("/api/workouts", methods=["GET"])
def get_workouts():
    logs = WorkoutLog.query.order_by(WorkoutLog.log_id).all()
    return jsonify([
        {
            "log_id": w.log_id,
            "user_id": w.user_id,
            "workout_date": w.workout_date,
            "workout_type": w.workout_type,
            "duration_minutes": w.duration_minutes,
            "calories_burned": w.calories_burned,
            "notes": w.notes,
        }
        for w in logs
    ])


@app.route("/api/workouts", methods=["POST"])
def create_workout():
    data = request.get_json() or {}
    w = WorkoutLog(
        user_id=data.get("user_id"),
        workout_date=data.get("workout_date"),
        workout_type=data.get("workout_type"),
        duration_minutes=data.get("duration_minutes"),
        calories_burned=data.get("calories_burned"),
        notes=data.get("notes"),
    )
    db.session.add(w)
    db.session.commit()
    return jsonify({"message": "workout created", "log_id": w.log_id}), 201


@app.route("/api/workouts/<int:log_id>", methods=["PUT"])
def update_workout(log_id):
    w = WorkoutLog.query.get_or_404(log_id)
    data = request.get_json() or {}
    w.user_id = data.get("user_id", w.user_id)
    w.workout_date = data.get("workout_date", w.workout_date)
    w.workout_type = data.get("workout_type", w.workout_type)
    w.duration_minutes = data.get("duration_minutes", w.duration_minutes)
    w.calories_burned = data.get("calories_burned", w.calories_burned)
    w.notes = data.get("notes", w.notes)
    db.session.commit()
    return jsonify({"message": "workout updated"})


@app.route("/api/workouts/<int:log_id>", methods=["DELETE"])
def delete_workout(log_id):
    w = WorkoutLog.query.get_or_404(log_id)
    db.session.delete(w)
    db.session.commit()
    return jsonify({"message": "workout deleted"})


if __name__ == "__main__":
    app.run(debug=True)


