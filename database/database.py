#import libraries
import requests
import pymysql

#define function to get all countries information
def get_all_countries_info():
    #informations from this api
    api_url = "https://restcountries.com/v2/all"

    try:
        response = requests.get(api_url) #HTTP GET request to api_url, returns 'Response' object
        response.raise_for_status()  # Check for HTTP errors, if there is an error the code in except block will be executed
        data = response.json() #If the HTTP request is successful (status code 2xx), this line parses the response content as JSON
        #The json() method is used to decode the JSON content of the response and return it as a Python data structure
        #In this case, it is expected that the API returns a JSON object, and data will be a Python dictionary or list representing that JSON object

        if data and isinstance(data, list): #if data is not empty or NONE; isinstance checks if data is an instance of the list; both conditions need to be true
            countries_info = [] #this list stores info about each country
            for country in data:
                country_info = { #this is dictionary, it contains key-value pairs
                    "country_name": country.get("name", ""),
                    "capital_city": country.get("capital", ""),
                    "flag_png_url": country.get("flags", {}).get("png", ""), #nested
                    "region": country.get("region", "")
                }
                countries_info.append(country_info) #for each country appended to the countries_info list
            return countries_info
        else:
            print("Invalid response from the API.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error making the API request: {e}")
        return None

def save_to_database(country_info):
    # database informations
    db_host = "localhost"
    db_user = "root"
    db_password = ""
    db_name = "quiz"

    try:
        # Connect to the database
        connection = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name
        )

        # Create a cursor
        cursor = connection.cursor() #to interact with mysql database

        # Insert country's information into the database (country table)
        query = "INSERT INTO country (country, capital_city, flag, region) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (
            country_info["country_name"],
            country_info["capital_city"],
            country_info["flag_png_url"],
            country_info["region"]
        ))

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
        print(f"Capital City: {country_info['capital_city']}")
        print(f"Flag PNG URL: {country_info['flag_png_url']}")
        print(f"Region: {country_info['region']}")
        print("------------------------")

        # Save to database
        save_to_database(country_info)
