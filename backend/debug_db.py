import sqlite3
import json

DB_PATH = "foodchain.db"

def check():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print("--- ACTOR REPUTATION ---")
    cursor.execute("SELECT * FROM actor_reputation")
    for row in cursor.fetchall():
        print(row)
    
    print("\n--- BATCH HISTORY ---")
    cursor.execute("SELECT * FROM batch_history LIMIT 5")
    for row in cursor.fetchall():
        print(row)
    conn.close()

if __name__ == "__main__":
    check()
