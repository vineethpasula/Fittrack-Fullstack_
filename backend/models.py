from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.String, nullable=False)

    memberships = db.relationship("Membership", backref="user", lazy=True)
    workout_logs = db.relationship("WorkoutLog", backref="user", lazy=True)


class Membership(db.Model):
    __tablename__ = "memberships"

    membership_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    plan_type = db.Column(db.String, nullable=False)
    start_date = db.Column(db.String, nullable=False)
    end_date = db.Column(db.String)
    status = db.Column(db.String, nullable=False)
    price = db.Column(db.Float, nullable=False)

    payments = db.relationship("Payment", backref="membership", lazy=True)


class Trainer(db.Model):
    __tablename__ = "trainers"

    trainer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), unique=True, nullable=False)
    specialty = db.Column(db.String)
    experience_years = db.Column(db.Integer)

    classes = db.relationship("FitnessClass", backref="trainer", lazy=True)


class FitnessClass(db.Model):
    __tablename__ = "classes"

    class_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    trainer_id = db.Column(db.Integer, db.ForeignKey("trainers.trainer_id"))
    capacity = db.Column(db.Integer)
    start_time = db.Column(db.String)
    end_time = db.Column(db.String)
    location = db.Column(db.String)

    registrations = db.relationship("ClassRegistration", backref="fitness_class", lazy=True)


class ClassRegistration(db.Model):
    __tablename__ = "class_registrations"

    registration_id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.class_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    registered_at = db.Column(db.String, nullable=False)
    status = db.Column(db.String, nullable=False)


class WorkoutLog(db.Model):
    __tablename__ = "workout_logs"

    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    workout_date = db.Column(db.String, nullable=False)
    workout_type = db.Column(db.String)
    duration_minutes = db.Column(db.Integer)
    calories_burned = db.Column(db.Integer)
    notes = db.Column(db.String)


class Payment(db.Model):
    __tablename__ = "payments"

    payment_id = db.Column(db.Integer, primary_key=True)
    membership_id = db.Column(db.Integer, db.ForeignKey("memberships.membership_id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.String, nullable=False)
    method = db.Column(db.String, nullable=False)
    status = db.Column(db.String, nullable=False)
