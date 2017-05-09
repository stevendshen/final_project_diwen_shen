##### CPLN 692 FINAL PROJECT - DIWEN SHEN


##### IMPORTS

# install requests package via terminal:
# pip3 install requests
import requests

# install bs4 package via terminal:
# pip3 install bs4
from bs4 import BeautifulSoup

# import csv package
import csv
       
##### FUNCTIONS: SCRAP HTML FROM WEB, SAVE TO LIST

def scrape_data(route_number):
    """
    takes route_number as string, downloads an html, cleans data
    returns schedule of departures as a list in a readable format
    """

    # Get html file from web
    page = requests.get("http://www.septa.org/schedules/bus/w/" + route_number + "_0.htm")
    # A status_code of 200 means that the page downloaded successfully

    # Create new BS4 object
    soup = BeautifulSoup(page.content, 'html.parser')
    # print(soup.prettify())

    # Get a list of all elements in <td>
    some_list1 = soup.find_all('td') # get the table (approximately)
    some_list2 = some_list1[0] # get the first col in the table
    some_list3 = some_list2.find_all('tr') # parse the col into a list of departures

    # get the text of each element
    some_list4 = []
    for i in range(0, len(some_list3)):
        some_list4.append(some_list3[i].get_text())

    # delete "-" elemens from the list
    some_list5 = [x for x in some_list4 if x != '—']

    # format each element in the list
    some_list6 = []
    for i in range(0, len(some_list5)):
        new_string = some_list5[i][ : some_list5[i].index('m') + 1]
        some_list6.append(new_string)

    # return
    return some_list6


##### FUNTIONS: CALCULATE HEADWAYS FOR DIFFERENT TIMES OF DAY

def get_hour(some_string):
    """takes a string formatted "hh:mm: or "h:mm" and returns the h or hh as int"""
    hour = some_string[: some_string.index(':')]
    hour = int(hour)
    return hour


def get_minute(some_string):
    """takes a string formatted "hh:mm: or "h:mm" and returns the mm as int"""
    minute = some_string[some_string.index(':') + 1 : some_string.index(':') + 3]
    minute = int(minute)
    return minute

    
def calculate_headway(some_hour, some_scraped_data, some_route_number):
    """
    takes an hour as int, and the scraped schedule as list from the scrape_data() function
    calculates the headway for that hour, and returns headway as string

    procedure:
    - finds the first and second departure in some_hour, and calculates and returns headway
    - if there is only 1 departure in some_hour, finds the departure in the next hour and returns headway
    - if there are no departures in the next hour as well, returns ">60"
    - if there are no departures in some_hour, returns "--"
    - ensures function works if some_hour is 23, where the next hour should be 0 instead of 24
    - ensures function works if the departure is the last one of the day, where finding the next departure will result in index error
    """

    # load scraped data from the scrape_data() function
    # change the schedule into 24hr format to prepare for calculations
    # change PM departures: add 12 to hour
    # takes into account the case of 12pm and 12am
    # first find the position of the ":"
    some_list7 = []
    for i in range(0, len(some_scraped_data)):
        hour = some_scraped_data[i][ : some_scraped_data[i].index(':')]
        minute = some_scraped_data[i][some_scraped_data[i].index(':') + 1 : some_scraped_data[i].index(':') + 3]
        am_pm = some_scraped_data[i][some_scraped_data[i].index(':') + 3 : ]
        if (hour == "12") & (am_pm == "pm"): # case of 12pm, don't add 12
            some_list7.append("12:" + minute)
        elif (hour == "12") & (am_pm == "am"): # case of 12am, change to 0
            some_list7.append("0:" + minute)
        elif am_pm == "pm": # for normal pm cases
            some_list7.append(str(int(hour) + 12) + ":" + minute) # if pm, add 12 to hour      
        else: # for normal am cases
            some_list7.append(hour + ":" + minute)
            
    # initialize values
    departure1 = 0
    departure2 = 0

    # for loop
    for i in range(0, len(some_list7)):
        if get_hour(some_list7[i]) == some_hour: # if there is a departure in this hour
            departure1 = get_minute(some_list7[i]) # get the minute of that departure

            # check that i is not the last departure of the day
            # no elif's will be triggered, preventing index error
            if i == len(some_list7) - 1:
                headway = "--"
                
            # check if there is another departure in this hour
            # if so, get the minute of that departure
            elif get_hour(some_list7[i+1]) == some_hour: # if the next departure is also in the same hour
                departure2 = get_minute(some_list7[i+1]) # get the minute of that departure
                headway = str(departure2 - departure1) # calculate headway
                
            # if there are no more departures this hour, check if there are departures in the next hour
            elif get_hour(some_list7[i+1]) == some_hour + 1:
                departure2 = get_minute(some_list7[i+1]) + 60
                headway = str(departure2 - departure1) # calculate headway

            # if the next hour is 24, check hour 0 instead
            elif (some_hour == 23) & (get_hour(some_list7[i+1]) == 0):
                departure2 = get_minute(some_list7[i+1]) + 60
                headway = str(departure2 - departure1) # calculate headway
                
            # if there are no departures in the next hour, note headway > 60min
            else:
                headway = ">60" # calculate headway

            # once headway is successfully generated, break the program
            break

        # if there are no departures this hour
        else:
            headway = "--" # calculate headway           
            
    # print headway
    # print("Route: " + some_route_number + ", Headway at " + str(some_hour) + "HRS: " + str(headway) + " min")

    # return
    return headway


##### GLOBAL VARIABLES

# Create a list of route numbers
routes = ["047m", "00H", "0XH", "LUCYGR", "LUCYGO", "G", "J", "K", "L", "R", "310", "311"]

for i in range (1, 10):
    routes.append("00" + str(i))

for i in range (10, 100):
    routes.append("0" + str(i))

for i in range (101, 151):
    routes.append(str(i))

for i in range (201, 207):
    routes.append(str(i))

# print(routes)


##### MAIN FUNCTION

# initialize list to store headways
headways = []
    
def main():
    
    # loop through the universe of route numbers
    for i in routes:
       
        # use try, if route number does not exist, print message but don't cause error
        try:
            
            # initialize variables
            route_number = i # route number must be in the same format as appears in the URL

            # scrape data
            scraped_data = scrape_data(route_number)

            # print schedule in readable format
            print("")
            print("Schedule for Route " + route_number + ":")
            print(scraped_data)

            # initialize sub-list for route i, the first element being the route number
            some_list = [i]
        
            print("")
            for i in range(0, 24):
                some_list.append(calculate_headway(i, scraped_data, route_number)) # this also prints to console

            # append list to main list
            headways.append(some_list)
            
        except:
            print("")
            print("Route " + route_number + " not found")
            pass

    # write to csv
    with open("output.csv",'w') as resultFile:
        wr = csv.writer(resultFile, dialect='excel')
        for some_list in headways:
            wr.writerow(some_list)
        resultFile.close()

if __name__ == "__main__":
    main()
    


