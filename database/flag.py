import requests
import pymysql

def get_all_countries_info():
    api_url = "https://restcountries.com/v2/all"
    
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Check for HTTP errors
        data = response.json()
        
        if data and isinstance(data, list):
            countries_info = []
            for country in data:
                country_info = {
                    "country_name": country.get("name", ""),
                    "flag_png_url": country.get("flags", {}).get("png", "")
                }
                countries_info.append(country_info)
            return countries_info
        else:
            print("Invalid response from the API.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error making the API request: {e}")
        return None

def save_to_database(country_info):
    # Replace these with your database connection details
    db_host = "localhost"
    db_user = "root"
    db_password = ""
    db_name = "country"

    try:
        # Connect to the database
        connection = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name
        )

        # Create a cursor
        cursor = connection.cursor()

        # Insert country's information into the database (flags table)
        query = "INSERT INTO flags (country, flag) VALUES (%s, %s)"
        cursor.execute(query, (country_info["country_name"], country_info["flag_png_url"]))

        # Commit the changes
        connection.commit()

        print(f"Data for {country_info['country_name']} successfully saved to the database.")

    except pymysql.Error as e:
        print(f"Database error: {e}")

    finally:
        # Close the connection
        if connection:
            connection.close()

# Example usage
all_countries_info = get_all_countries_info()

if all_countries_info:
    for index, country_info in enumerate(all_countries_info, start=1):
        print(f"Number: {index}")
        print(f"Country: {country_info['country_name']}")
        print(f"Flag PNG URL: {country_info['flag_png_url']}")
        print("------------------------")

        # Save to database
        save_to_database(country_info)
