import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

# ── CONFIG ────────────────────────────────────────────────────────────────────
YOUR_EMAIL = "sukandesejal@gmail.com"
YOUR_APP_PASSWORD = "ogla vupx bjrf lirq" 
# ─────────────────────────────────────────────────────────────────────────────

test_emails = [
    {
        "subject": "Lecture Notes - Data Structures Unit 4: Trees and Graphs",
        "body": """Dear Student,

Please find attached the lecture notes for Unit 4 covering Trees and Graphs.

Topics covered in today's session:
- Binary Search Trees
- AVL Trees and rotations  
- Graph representation (adjacency matrix and list)
- BFS and DFS traversal

Study material for next class: Chapter 7 of the textbook.

Recording of today's lecture will be uploaded by evening.

Regards,
Prof. R. Sharma
Department of Computer Engineering"""
    },
    {
        "subject": "Assignment 3 - Operating Systems: Process Scheduling",
        "body": """Dear Students,

Assignment 3 has been uploaded. Please submit before the deadline.

Assignment Topic: Process Scheduling Algorithms
- Implement FCFS, SJF, and Round Robin scheduling
- Compare average waiting time for each algorithm
- Submit a written report with your analysis

Submission Deadline: Friday, 27 June 2026
Submit via: college portal or email this address

Late submissions will not be accepted.

Prof. M. Patil
OS Lab Instructor"""
    },
    {
        "subject": "IMPORTANT ANNOUNCEMENT: Mid-Semester Examination Schedule",
        "body": """Dear Students,

This is to inform you that the Mid-Semester Examinations will be held as follows:

Date: 30 June 2026 to 5 July 2026
Venue: Main Examination Hall, Block A

Exam Schedule:
- 30 June: Data Structures (10:00 AM - 1:00 PM)
- 1 July: Operating Systems (10:00 AM - 1:00 PM)  
- 2 July: Database Management (10:00 AM - 1:00 PM)
- 3 July: Computer Networks (10:00 AM - 1:00 PM)

Students must bring their college ID card. No electronic devices allowed.

Regards,
Examination Department
Zeal College of Engineering"""
    },
    {
        "subject": "Timetable Change - DBMS Lecture Rescheduled",
        "body": """Dear Students,

Please note that the DBMS lecture scheduled for Monday 23 June has been 
RESCHEDULED due to faculty meeting.

Original Time: Monday 23 June, 10:00 AM
New Time: Tuesday 24 June, 2:00 PM
Venue: Room 302, B Block

Please update your timetable accordingly. The lab session on Wednesday 
remains unchanged.

Sorry for the inconvenience.

Prof. S. Kulkarni
DBMS Department"""
    },
    {
        "subject": "Workshop on Machine Learning - Register Now",
        "body": """Dear Students,

You are invited to a 2-day Workshop on Machine Learning and AI Applications.

Event Details:
Date: 28-29 June 2026
Time: 9:00 AM to 5:00 PM
Venue: Seminar Hall, Ground Floor
Fee: Free for college students

Topics:
Day 1: Introduction to ML, Supervised Learning, Python hands-on
Day 2: Neural Networks, Deep Learning, Project demonstration

Last date to register: 25 June 2026
Registration link: forms.college.edu/ml-workshop

Limited seats available. Register early!

Training & Placement Cell
Zeal College of Engineering"""
    },
    {
        "subject": "Study Resources - Computer Networks Reference Material",
        "body": """Hello,

Sharing some useful reference resources for Computer Networks exam preparation:

1. Forouzan - Data Communications and Networking (PDF attached)
2. Important topics for exam:
   - OSI and TCP/IP model layers
   - IP addressing and subnetting  
   - Routing protocols (RIP, OSPF, BGP)
   - TCP vs UDP
   - HTTP, FTP, DNS protocols

YouTube playlist for revision:
https://youtube.com/playlist?list=networking-fundamentals

Practice question bank will be shared next week.

All the best for your exams!

Study Group - TE Computer 2026"""
    },
    {
        "subject": "Lab Assignment Due - DBMS Mini Project Submission",
        "body": """Dear Students,

This is a reminder that your DBMS Mini Project is due next week.

Project Requirements:
- Design an ER diagram for your chosen system
- Implement the database in PostgreSQL or MySQL
- Write at least 10 SQL queries including joins and subqueries
- Submit a project report (minimum 15 pages)

Submission Deadline: 26 June 2026 before 5:00 PM
Submit to: Room 215, Computer Lab

Groups who have not submitted their topic for approval must do so 
immediately by emailing this address.

Dr. P. Joshi
Database Lab Coordinator"""
    },
    {
        "subject": "Upcoming Guest Lecture - Industry Expert on Cloud Computing",
        "body": """Dear Students,

We are pleased to announce a Guest Lecture by an Industry Expert.

Speaker: Mr. Rahul Verma, Senior Cloud Architect at TechCorp India
Topic: Cloud Computing and DevOps in the Real World
Date: 25 June 2026 (Wednesday)
Time: 11:00 AM to 1:00 PM
Venue: Auditorium, Main Building

Topics to be covered:
- AWS and Azure overview
- Containerization with Docker and Kubernetes
- CI/CD pipelines
- Career opportunities in Cloud

Attendance is compulsory for TE and BE students.

Department of Computer Engineering"""
    },
]


def send_emails():
    if not YOUR_APP_PASSWORD:
        print("ERROR: Please fill in YOUR_APP_PASSWORD first!")
        print("See instructions below.")
        return

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(YOUR_EMAIL, YOUR_APP_PASSWORD)
        print(f"Connected to Gmail. Sending {len(test_emails)} test emails...")

        for i, email_data in enumerate(test_emails):
            msg = MIMEMultipart()
            msg['From'] = YOUR_EMAIL
            msg['To'] = YOUR_EMAIL
            msg['Subject'] = email_data['subject']
            msg.attach(MIMEText(email_data['body'], 'plain'))

            server.sendmail(YOUR_EMAIL, YOUR_EMAIL, msg.as_string())
            print(f"✅ Sent {i+1}/{len(test_emails)}: {email_data['subject'][:50]}...")

        server.quit()
        print("\n🎉 All test emails sent! Now sync in EduInbox to see them classified.")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    send_emails()