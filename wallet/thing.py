import base58
byte_array = base58.b58decode('5SMbJqB4civ7odzTxhi64x5Qb9ihsWjYqVxtTd2iRtmPa2yK7oXCQJ5dZ7hzncrFWbsbMC28m5oKX8usRhvwe6XE')

json_string = "[" + ",".join(map(lambda b: str(b), byte_array)) + "]"
print(json_string)