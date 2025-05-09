import streamlit as st
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sqlite3
import hashlib
import datetime
import time
from streamlit_option_menu import option_menu

# Database setup
def init_db():
    conn = sqlite3.connect('healthcare.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 username TEXT UNIQUE,
                 email TEXT UNIQUE,
                 password TEXT,
                 user_type TEXT,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Children table
    c.execute('''CREATE TABLE IF NOT EXISTS children
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 name TEXT,
                 dob DATE,
                 gender TEXT,
                 blood_group TEXT,
                 birth_weight REAL,
                 FOREIGN KEY(user_id) REFERENCES users(id))''')
    
    # Pregnancies table
    c.execute('''CREATE TABLE IF NOT EXISTS pregnancies
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 start_date DATE,
                 expected_delivery DATE,
                 current_trimester INTEGER,
                 FOREIGN KEY(user_id) REFERENCES users(id))''')
    
    # Vaccination records
    c.execute('''CREATE TABLE IF NOT EXISTS vaccinations
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 child_id INTEGER,
                 vaccine_name TEXT,
                 scheduled_date DATE,
                 administered_date DATE,
                 status TEXT DEFAULT 'pending',
                 FOREIGN KEY(child_id) REFERENCES children(id))''')
    
    # Health records
    c.execute('''CREATE TABLE IF NOT EXISTS health_records
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 record_type TEXT,
                 value REAL,
                 date_recorded DATE,
                 FOREIGN KEY(user_id) REFERENCES users(id))''')
    
    # Notifications
    c.execute('''CREATE TABLE IF NOT EXISTS notifications
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 message TEXT,
                 notification_type TEXT,
                 is_read BOOLEAN DEFAULT 0,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 FOREIGN KEY(user_id) REFERENCES users(id))''')
    
    conn.commit()
    conn.close()

init_db()

# Hash password
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "your_email@gmail.com"  # Replace with your email
SMTP_PASSWORD = "your_app_password"     # Replace with your app password

def send_email(to_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USERNAME, to_email, text)
        server.quit()
        return True
    except Exception as e:
        st.error(f"Error sending email: {e}")
        return False

# Authentication functions
def create_user(username, email, password, user_type):
    conn = sqlite3.connect('healthcare.db')
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, email, password, user_type) VALUES (?, ?, ?, ?)",
                  (username, email, hash_password(password), user_type))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def verify_user(username, password):
    conn = sqlite3.connect('healthcare.db')
    c = conn.cursor()
    c.execute("SELECT id, username, email, user_type FROM users WHERE username = ? AND password = ?",
              (username, hash_password(password)))
    user = c.fetchone()
    conn.close()
    return user if user else None

# ML Models
def train_child_health_model():
    # Sample dataset for child health prediction
    data = {
        'fever': [1, 1, 0, 1, 0, 1, 0, 0, 1, 0],
        'cough': [1, 0, 1, 1, 0, 0, 1, 0, 1, 0],
        'rash': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        'vomiting': [0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        'diarrhea': [0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        'fatigue': [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        'disease': ['Flu', 'Chickenpox', 'Stomach Bug', 'Flu', 'Chickenpox', 
                   'Stomach Bug', 'Common Cold', 'Measles', 'Flu', 'Common Cold']
    }
    df = pd.DataFrame(data)
    X = df.drop('disease', axis=1)
    y = df['disease']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = DecisionTreeClassifier()
    model.fit(X_train, y_train)
    
    # Evaluate (in a real app, this would be more thorough)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy}")
    
    return model

def train_pregnancy_model():
    # Sample dataset for pregnancy health recommendations
    data = {
        'trimester': [1, 1, 1, 2, 2, 2, 3, 3, 3, 1],
        'weight_gain': [2, 3, 1, 5, 6, 4, 8, 9, 7, 2],
        'blood_pressure': [120, 118, 122, 125, 124, 126, 130, 128, 129, 121],
        'iron_level': [12, 11, 13, 10, 11, 12, 9, 10, 11, 12],
        'recommendation': [
            'Increase iron intake, light exercise',
            'Normal - continue current routine',
            'Increase iron intake, light exercise',
            'Monitor blood pressure, moderate exercise',
            'Normal - continue current routine',
            'Monitor blood pressure, moderate exercise',
            'Rest more, monitor blood pressure',
            'Rest more, prepare for delivery',
            'Rest more, monitor blood pressure',
            'Increase iron intake, light exercise'
        ]
    }
    df = pd.DataFrame(data)
    X = df.drop('recommendation', axis=1)
    y = df['recommendation']
    
    model = KNeighborsClassifier(n_neighbors=3)
    model.fit(X, y)
    return model

child_health_model = train_child_health_model()
pregnancy_model = train_pregnancy_model()

# Vaccination schedule (based on IAP recommendations)
vaccination_schedule = {
    'Birth': ['BCG', 'Hepatitis B-1', 'OPV-0'],
    '6 Weeks': ['DTwP/DTaP-1', 'IPV-1', 'Hib-1', 'Hepatitis B-2', 'Rotavirus-1', 'PCV-1'],
    '10 Weeks': ['DTwP/DTaP-2', 'IPV-2', 'Hib-2', 'Rotavirus-2', 'PCV-2'],
    '14 Weeks': ['DTwP/DTaP-3', 'IPV-3', 'Hib-3', 'Rotavirus-3', 'PCV-3'],
    '6 Months': ['Influenza-1', 'Hepatitis B-3'],
    '7 Months': ['Influenza-2'],
    '9 Months': ['MMR-1', 'Typhoid Conjugate Vaccine'],
    '12 Months': ['Hepatitis A-1', 'PCV Booster'],
    '15 Months': ['MMR-2', 'Varicella-1'],
    '16 Months': ['DTwP/DTaP Booster-1', 'IPV Booster-1', 'Hib Booster'],
    '18 Months': ['Hepatitis A-2', 'Varicella-2'],
    '2 Years': ['Typhoid Booster'],
    '4-6 Years': ['DTwP/DTaP Booster-2', 'IPV Booster-2', 'MMR-3'],
    '10-12 Years': ['Tdap/Td', 'HPV (2 doses)']
}

# Pregnancy recommendations by trimester
pregnancy_recommendations = {
    1: {
        'nutrition': [
            "Increase folic acid intake (400-800 mcg daily)",
            "Eat iron-rich foods (leafy greens, beans, lean meats)",
            "Stay hydrated (8-10 glasses of water daily)",
            "Small, frequent meals to combat nausea"
        ],
        'exercise': [
            "Light walking (20-30 minutes daily)",
            "Prenatal yoga (avoid hot yoga)",
            "Pelvic floor exercises",
            "Avoid high-impact activities"
        ],
        'precautions': [
            "Avoid alcohol, smoking, and drugs",
            "Limit caffeine to 200mg per day",
            "Avoid raw fish, undercooked meat, and unpasteurized dairy",
            "Get plenty of rest"
        ]
    },
    2: {
        'nutrition': [
            "Increase protein intake (75-100g daily)",
            "Calcium-rich foods (dairy, fortified plant milks, leafy greens)",
            "Omega-3 fatty acids (salmon, chia seeds, walnuts)",
            "Fiber to prevent constipation"
        ],
        'exercise': [
            "Moderate walking or swimming",
            "Prenatal yoga or Pilates",
            "Kegel exercises",
            "Avoid exercises lying flat on back"
        ],
        'precautions': [
            "Monitor weight gain (1-2 lbs per week)",
            "Sleep on your side",
            "Wear comfortable, supportive shoes",
            "Attend all prenatal checkups"
        ]
    },
    3: {
        'nutrition': [
            "Continue balanced diet with focus on iron and calcium",
            "Smaller, more frequent meals as stomach space decreases",
            "Stay hydrated to prevent contractions",
            "Limit salty foods to reduce swelling"
        ],
        'exercise': [
            "Gentle walking or swimming",
            "Pelvic tilts and stretching",
            "Perineal massage (from 34 weeks)",
            "Focus on posture and breathing"
        ],
        'precautions': [
            "Watch for signs of preeclampsia (swelling, headaches)",
            "Prepare hospital bag by 36 weeks",
            "Learn signs of labor",
            "Rest when possible"
        ]
    }
}

# Streamlit app
def main():
    st.set_page_config(
        page_title="Child & Maternal Health Care System",
        page_icon="👶",
        layout="wide"
    )
    
    if 'user' not in st.session_state:
        st.session_state.user = None
    if 'page' not in st.session_state:
        st.session_state.page = 'home'
    
    # Custom CSS
    st.markdown("""
    <style>
        .main {
            background-color: #f5f9ff;
        }
        .sidebar .sidebar-content {
            background-color: #e0f7fa;
        }
        .stButton>button {
            background-color: #4CAF50;
            color: white;
            border-radius: 5px;
            padding: 0.5rem 1rem;
        }
        .stButton>button:hover {
            background-color: #45a049;
        }
        .stTextInput>div>div>input, .stNumberInput>div>div>input, .stDateInput>div>div>input, .stSelectbox>div>div>select {
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .stAlert {
            border-radius: 5px;
        }
        .title {
            color: #1976D2;
        }
        .card {
            background-color: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
    </style>
    """, unsafe_allow_html=True)
    
    # Navigation
    if st.session_state.user:
        with st.sidebar:
            st.image("https://via.placeholder.com/150x50?text=HealthCare", width=150)
            st.markdown(f"## Welcome, {st.session_state.user[1]}!")
            
            menu_options = []
            if st.session_state.user[3] == 'parent':
                menu_options = ["Dashboard", "Child Health", "Vaccination Tracker", "Growth Monitoring", "Notifications"]
            elif st.session_state.user[3] == 'pregnant':
                menu_options = ["Dashboard", "Pregnancy Care", "Nutrition Guide", "Exercise Tips", "Notifications"]
            
            selected = option_menu(
                menu_title="Main Menu",
                options=menu_options,
                icons=['house', 'heart-pulse', 'calendar-check', 'graph-up', 'bell'],
                menu_icon="cast",
                default_index=0
            )
            
            if st.button("Logout"):
                st.session_state.user = None
                st.session_state.page = 'home'
                st.rerun()
    
    # Pages
    if not st.session_state.user:
        auth_page()
    else:
        if selected == "Dashboard":
            dashboard_page()
        elif selected == "Child Health" and st.session_state.user[3] == 'parent':
            child_health_page()
        elif selected == "Vaccination Tracker" and st.session_state.user[3] == 'parent':
            vaccination_tracker_page()
        elif selected == "Growth Monitoring" and st.session_state.user[3] == 'parent':
            growth_monitoring_page()
        elif selected == "Pregnancy Care" and st.session_state.user[3] == 'pregnant':
            pregnancy_care_page()
        elif selected == "Nutrition Guide" and st.session_state.user[3] == 'pregnant':
            nutrition_guide_page()
        elif selected == "Exercise Tips" and st.session_state.user[3] == 'pregnant':
            exercise_tips_page()
        elif selected == "Notifications":
            notifications_page()

# Authentication Page
def auth_page():
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.image("https://via.placeholder.com/400x300?text=Child+and+Maternal+Health", width=400)
    
    with col2:
        st.markdown("<h1 class='title'>Child & Maternal Health Care System</h1>", unsafe_allow_html=True)
        
        tab1, tab2 = st.tabs(["Login", "Sign Up"])
        
        with tab1:
            with st.form("login_form"):
                username = st.text_input("Username")
                password = st.text_input("Password", type="password")
                submit = st.form_submit_button("Login")
                
                if submit:
                    user = verify_user(username, password)
                    if user:
                        st.session_state.user = user
                        st.success("Login successful!")
                        time.sleep(1)
                        st.rerun()
                    else:
                        st.error("Invalid username or password")
        
        with tab2:
            with st.form("signup_form"):
                st.markdown("### Create an Account")
                username = st.text_input("Choose a Username")
                email = st.text_input("Email Address")
                password = st.text_input("Create Password", type="password")
                confirm_password = st.text_input("Confirm Password", type="password")
                user_type = st.selectbox("I am a...", ["parent", "pregnant"])
                submit = st.form_submit_button("Sign Up")
                
                if submit:
                    if password != confirm_password:
                        st.error("Passwords do not match")
                    else:
                        if create_user(username, email, password, user_type):
                            st.success("Account created successfully! Please login.")
                            # Send welcome email
                            email_body = f"""
                            Welcome to the Child & Maternal Health Care System!
                            
                            Thank you for creating an account. Here are your details:
                            Username: {username}
                            Account Type: {user_type}
                            
                            We're here to support you and your family's health journey.
                            
                            Best regards,
                            HealthCare Team
                            """
                            if send_email(email, "Welcome to HealthCare System", email_body):
                                st.info("A welcome email has been sent to your address.")
                        else:
                            st.error("Username or email already exists")

# Dashboard Page
def dashboard_page():
    st.markdown("<h1 class='title'>Dashboard</h1>", unsafe_allow_html=True)
    
    if st.session_state.user[3] == 'parent':
        # Parent dashboard
        conn = sqlite3.connect('healthcare.db')
        c = conn.cursor()
        
        # Get children count
        c.execute("SELECT COUNT(*) FROM children WHERE user_id = ?", (st.session_state.user[0],))
        children_count = c.fetchone()[0]
        
        # Get pending vaccinations
        c.execute("""SELECT COUNT(*) FROM vaccinations v 
                     JOIN children c ON v.child_id = c.id 
                     WHERE c.user_id = ? AND v.status = 'pending' 
                     AND v.scheduled_date <= date('now')""", 
                  (st.session_state.user[0],))
        pending_vaccines = c.fetchone()[0]
        
        conn.close()
        
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("""
            <div class="card">
                <h3>👶 My Children</h3>
                <p style="font-size: 24px; font-weight: bold;">{}</p>
                <p>Registered in the system</p>
            </div>
            """.format(children_count), unsafe_allow_html=True)
            
            if st.button("Add New Child"):
                add_child_form()
        
        with col2:
            st.markdown("""
            <div class="card">
                <h3>💉 Vaccinations Due</h3>
                <p style="font-size: 24px; font-weight: bold;">{}</p>
                <p>Require immediate attention</p>
            </div>
            """.format(pending_vaccines), unsafe_allow_html=True)
            
            if st.button("View Vaccination Schedule"):
                st.session_state.page = 'vaccination'
                st.rerun()
        
        st.markdown("### Recent Notifications")
        display_notifications(limit=3)
        
    else:
        # Pregnant woman dashboard
        conn = sqlite3.connect('healthcare.db')
        c = conn.cursor()
        
        # Get pregnancy info
        c.execute("SELECT start_date, expected_delivery, current_trimester FROM pregnancies WHERE user_id = ?", 
                  (st.session_state.user[0],))
        pregnancy = c.fetchone()
        
        conn.close()
        
        if pregnancy:
            start_date, expected_delivery, trimester = pregnancy
            weeks_pregnant = (datetime.date.today() - datetime.datetime.strptime(start_date, '%Y-%m-%d').date()).days // 7
            days_to_go = (datetime.datetime.strptime(expected_delivery, '%Y-%m-%d').date() - datetime.date.today()).days
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.markdown("""
                <div class="card">
                    <h3>🤰 Weeks Pregnant</h3>
                    <p style="font-size: 24px; font-weight: bold;">{} weeks</p>
                    <p>Started on {}</p>
                </div>
                """.format(weeks_pregnant, start_date), unsafe_allow_html=True)
            
            with col2:
                st.markdown("""
                <div class="card">
                    <h3>📅 Days to Go</h3>
                    <p style="font-size: 24px; font-weight: bold;">{} days</p>
                    <p>Expected on {}</p>
                </div>
                """.format(days_to_go, expected_delivery), unsafe_allow_html=True)
            
            with col3:
                st.markdown("""
                <div class="card">
                    <h3>🔢 Current Trimester</h3>
                    <p style="font-size: 24px; font-weight: bold;">{}{}</p>
                    <p>{}</p>
                </div>
                """.format(
                    trimester,
                    "st" if trimester == 1 else "nd" if trimester == 2 else "rd",
                    "First Trimester" if trimester == 1 else "Second Trimester" if trimester == 2 else "Third Trimester"
                ), unsafe_allow_html=True)
            
            st.markdown("### This Week's Recommendations")
            if trimester in pregnancy_recommendations:
                recs = pregnancy_recommendations[trimester]
                tab1, tab2, tab3 = st.tabs(["Nutrition", "Exercise", "Precautions"])
                
                with tab1:
                    for item in recs['nutrition']:
                        st.markdown(f"- {item}")
                
                with tab2:
                    for item in recs['exercise']:
                        st.markdown(f"- {item}")
                
                with tab3:
                    for item in recs['precautions']:
                        st.markdown(f"- {item}")
            
            st.markdown("### Recent Notifications")
            display_notifications(limit=3)
        else:
            st.info("You haven't registered a pregnancy yet.")
            if st.button("Register Pregnancy"):
                register_pregnancy_form()

# Child Health Page
def child_health_page():
    st.markdown("<h1 class='title'>Child Health Assessment</h1>", unsafe_allow_html=True)
    
    conn = sqlite3.connect('healthcare.db')
    c = conn.cursor()
    c.execute("SELECT id, name FROM children WHERE user_id = ?", (st.session_state.user[0],))
    children = c.fetchall()
    conn.close()
    
    if children:
        child_options = [f"{child[1]} (ID: {child[0]})" for child in children]
        selected_child = st.selectbox("Select Child", child_options)
        child_id = int(selected_child.split("ID: ")[1].replace(")", ""))
        
        st.markdown("### Symptom Checker")
        with st.form("symptom_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                fever = st.checkbox("Fever")
                cough = st.checkbox("Cough")
                rash = st.checkbox("Rash")
            
            with col2:
                vomiting = st.checkbox("Vomiting")
                diarrhea = st.checkbox("Diarrhea")
                fatigue = st.checkbox("Fatigue")
            
            submitted = st.form_submit_button("Assess Symptoms")
            
            if submitted:
                symptoms = {
                    'fever': 1 if fever else 0,
                    'cough': 1 if cough else 0,
                    'rash': 1 if rash else 0,
                    'vomiting': 1 if vomiting else 0,
                    'diarrhea': 1 if diarrhea else 0,
                    'fatigue': 1 if fatigue else 0
                }
                
                # Convert to DataFrame for prediction
                symptoms_df = pd.DataFrame([symptoms])
                prediction = child_health_model.predict(symptoms_df)[0]
                
                st.markdown(f"### Assessment Result: *{prediction}*")
                
                # Add to notifications
                conn = sqlite3.connect('healthcare.db')
                c = conn.cursor()
                message = f"Symptom assessment for {selected_child.split(' (')[0]}: Possible {prediction}"
                c.execute("INSERT INTO notifications (user_id, message, notification_type) VALUES (?, ?, ?)",
                          (st.session_state.user[0], message, 'health_alert'))
                conn.commit()
                conn.close()
                
                # Show recommendations based on prediction
                if prediction == 'Flu':
                    st.info("""
                    *Recommendations:*
                    - Rest and plenty of fluids
                    - Child-appropriate fever reducers (consult doctor for dosage)
                    - Monitor temperature regularly
                    - Seek medical attention if fever persists beyond 3 days
                    """)
                elif prediction == 'Chickenpox':
                    st.warning("""
                    *Recommendations:*
                    - Keep child comfortable and cool
                    - Use calamine lotion for itching
                    - Trim nails to prevent scratching
                    - Seek medical attention immediately if blisters become infected
                    """)
                elif prediction == 'Stomach Bug':
                    st.info("""
                    *Recommendations:*
                    - Small sips of oral rehydration solution
                    - BRAT diet (bananas, rice, applesauce, toast)
                    - Rest and monitor for dehydration signs
                    - Seek medical attention if vomiting/diarrhea persists beyond 24 hours
                    """)
                elif prediction == 'Common Cold':
                    st.info("""
                    *Recommendations:*
                    - Rest and fluids
                    - Saline nasal drops
                    - Humidifier in room
                    - Consult doctor if symptoms worsen
                    """)
                elif prediction == 'Measles':
                    st.error("""
                    *URGENT RECOMMENDATIONS:*
                    - Measles can be serious in young children
                    - Contact healthcare provider immediately
                    - Isolate child to prevent spread
                    - Monitor for high fever or difficulty breathing
                    """)
    else:
        st.info("You haven't registered any children yet.")
        if st.button("Add Child"):
            add_child_form()

# Vaccination Tracker Page
def vaccination_tracker_page():
    st.markdown("<h1 class='title'>Vaccination Tracker</h1>", unsafe_allow_html=True)
    
    conn = sqlite3.connect('healthcare.db')
    c = conn.cursor()
    c.execute("SELECT id, name, dob FROM children WHERE user_id = ?", (st.session_state.user[0],))
    children = c.fetchall()
    
    if children:
        child_options = [f"{child[1]} (DOB: {child[2]})" for child in children]
        selected_child = st.selectbox("Select Child", child_options)
        child_id = [child[0] for child in children if child[1] in selected_child][0]
        child_dob = [child[2] for child in children if child[1] in selected_child][0]
        
        # Calculate age in months
        dob_date = datetime.datetime.strptime(child_dob, '%Y-%m-%d').date()
        today = datetime.date.today()
        age_months = (today.year - dob_date.year) * 12 + (today.month - dob_date.month)
        
        # Get vaccinations for this child
        c.execute("SELECT id, vaccine_name, scheduled_date, administered_date, status FROM vaccinations WHERE child_id = ?", 
                  (child_id,))
        vaccinations = c.fetchall()
        
        st.markdown(f"### Vaccination Status for {selected_child.split(' (')[0]} (Age: {age_months} months)")
        
        # Show upcoming vaccinations
        st.markdown("#### Upcoming Vaccinations")
        upcoming = [v for v in vaccinations if v[4] == 'pending' and datetime.datetime.strptime(v[2], '%Y-%m-%d').date() >= today]
        
        if upcoming:
            for vax in upcoming:
                days_until = (datetime.datetime.strptime(vax[2], '%Y-%m-%d').date() - today).days
                st.markdown(f"""
                <div class="card">
                    <h4>{vax[1]}</h4>
                    <p>Scheduled: {vax[2]} ({'Today' if days_until == 0 else f'in {days_until} days'})</p>
                    {f"<p style='color: red;'>Due now!</p>" if days_until <= 7 else ""}
                    <button onclick="window.location.href='?mark_as_done={vax[0]}'" style="background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        Mark as Done
                    </button>
                </div>
                """, unsafe_allow_html=True)
                
                # Send reminder if due within 7 days
                if days_until <= 7:
                    message = f"Reminder: {vax[1]} vaccination for {selected_child.split(' (')[0]} is due on {vax[2]}"
                    c.execute("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND message = ?", 
                              (st.session_state.user[0], message))
                    if c.fetchone()[0] == 0:
                        c.execute("INSERT INTO notifications (user_id, message, notification_type) VALUES (?, ?, ?)",
                                  (st.session_state.user[0], message, 'vaccine_reminder'))
                        conn.commit()
                        
                        # Send email reminder
                        email_body = f"""
                        Vaccination Reminder for {selected_child.split(' (')[0]}
                        
                        Vaccine: {vax[1]}
                        Due Date: {vax[2]}
                        Location: Your pediatrician's office or local health clinic
                        
                        Please schedule an appointment to ensure your child's timely vaccination.
                        
                        Best regards,
                        HealthCare Team
                        """
                        send_email(st.session_state.user[2], f"Vaccination Reminder: {vax[1]}", email_body)
        else:
            st.success("No upcoming vaccinations - your child is up to date!")
        
        # Show completed vaccinations
        st.markdown("#### Completed Vaccinations")
        completed = [v for v in vaccinations if v[4] == 'completed']
        
        if completed:
            for vax in completed:
                st.markdown(f"""
                <div class="card">
                    <h4>{vax[1]}</h4>
                    <p>Administered on: {vax[3]}</p>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("No vaccinations completed yet.")
        
        # Show vaccination schedule
        st.markdown("#### Full Vaccination Schedule")
        schedule_df = pd.DataFrame.from_dict(vaccination_schedule, orient='index').transpose()
        st.dataframe(schedule_df, use_container_width=True)
        
        # Button to add missing vaccinations
        if st.button("Add Missing Vaccinations"):
            add_missing_vaccinations(child_id, child_dob)
            st.rerun()
    else:
        st.info("You haven't registered any children yet.")
        if st.button("Add Child"):
            add_child_form()
    
    conn.close()

# Growth Monitoring Page
def growth_monitoring_page():
    st.markdown("<h1 class='title'>Growth Monitoring</h1>", unsafe_allow_html=True)
    
    conn = sqlite3.connect('healthcare.db')
    c = conn.cursor()
    c.execute("SELECT id, name, dob, gender FROM children WHERE user_id = ?", (st.session_state.user[0],))
    children = c.fetchall()
    
    if children:
        child_options = [f"{child[1]} (DOB: {child[2]})" for child in children]
        selected_child = st.selectbox("Select Child", child_options)
        child_id = [child[0] for child in children if child[1] in selected_child][0]
        child_dob = [child[2] for child in children if child[1] in selected_child][0]
        child_gender = [child[3] for child in children if child[1] in selected_child][0]
        
        # Calculate age in months
        dob_date = datetime.datetime.strptime(child_dob, '%Y-%m-%d').date()
        today = datetime.date.today()
        age_months = (today.year - dob_date.year) * 12 + (today.month - dob_date.month)
        
        # Get growth records
        c.execute("""SELECT date_recorded, value 
                     FROM health_records 
                     WHERE user_id = ? AND record_type = 'height' 
                     ORDER BY date_recorded""", 
                  (st.session_state.user[0],))
        height_records = c.fetchall()
        
        c.execute("""SELECT date_recorded, value 
                     FROM health_records 
                     WHERE user_id = ? AND record_type = 'weight' 
                     ORDER BY date_recorded""", 
                  (st.session_state.user[0],))
        weight_records = c.fetchall()
        
        st.markdown(f"### Growth Records for {selected_child.split(' (')[0]}")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### Add New Measurement")
            with st.form("growth_form"):
                record_type = st.selectbox("Measurement Type", ["height", "weight", "head_circumference"])
                value = st.number_input("Value", min_value=0.0, step=0.1)
                date_recorded = st.date_input("Date", today)
                
                if st.form_submit_button("Save Measurement"):
                    c.execute("""INSERT INTO health_records (user_id, record_type, value, date_recorded) 
                                VALUES (?, ?, ?, ?)""",
                              (st.session_state.user[0], record_type, value, date_recorded.strftime('%Y-%m-%d')))
                    conn.commit()
                    st.success("Measurement saved!")
                    time.sleep(1)
                    st.rerun()
        
        with col2:
            st.markdown("#### Growth Charts")
            tab1, tab2 = st.tabs(["Height", "Weight"])
            
            with tab1:
                if height_records:
                    df = pd.DataFrame(height_records, columns=['Date', 'Height (cm)'])
                    st.line_chart(df.set_index('Date'))
                else:
                    st.info("No height records yet.")
            
            with tab2:
                if weight_records:
                    df = pd.DataFrame(weight_records, columns=['Date', 'Weight (kg)'])
                    st.line_chart(df.set_index('Date'))
                else:
                    st.info("No weight records yet.")
        
        # WHO growth standards comparison
        st.markdown("#### Growth Percentiles")
        if height_records and weight_records:
            latest_height = height_records[-1][1]
            latest_weight = weight_records[-1][1]
            
            # Simplified percentile calculation (in a real app, use WHO growth standards)
            if child_gender.lower() == 'male':
                height_percentile = min(100, max(5, int(50 + (latest_height - (70 + age_months * 2.5)) * 2)))
                weight_percentile = min(100, max(5, int(50 + (latest_weight - (3.3 + age_months * 0.5)) * 10)))
            else:
                height_percentile = min(100, max(5, int(50 + (latest_height - (68 + age_months * 2.5)) * 2)))
                weight_percentile = min(100, max(5, int(50 + (latest_weight - (3.2 + age_months * 0.45)) * 10)))
            
            col1, col2 = st.columns(2)
            with col1:
                st.markdown(f"""
                <div class="card">
                    <h4>Height</h4>
                    <p>{latest_height} cm</p>
                    <p>Percentile: {height_percentile}%</p>
                    <progress value="{height_percentile}" max="100" style="width: 100%;"></progress>
                </div>
                """, unsafe_allow_html=True)
            
            with col2:
                st.markdown(f"""))