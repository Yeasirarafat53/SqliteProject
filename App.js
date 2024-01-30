import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import {openDatabase, deleteDatabase} from 'react-native-sqlite-storage';

let db = openDatabase({name: 'UserDatase.db'});
// let db = deleteDatabase({name: 'SchoolDatabase1.db'});

const App = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [userList, setUserList] = useState([]);

  console.log('this is user list', JSON.stringify(userList, null, 2));

  // const [startDate, setStartDate] = useState(new Date());

  // const currentDate = new Date();
  // const isoDateString = currentDate.toISOString();
 
  const date = moment();
  const localDateTime = date.format('MM/DD/YYYY hh:mm:ss');
  // console.log('date', isoDateString);

  // const isFocused = useIsFocused()

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/posts',
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // ======== create table =======

  // 1=> query
  // 2=>values inside array
  // 3=>callback method for response
  useEffect(() => {
    db.transaction(txn => {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_user'", // query
        [], // values inside array
        (tx, res) => {
          // callback function for response
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_user', []);
            txn.executeSql(
              // 'CREATE TABLE IF NOT EXISTS table_user(user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_name VARCHAR(20), user_email VARCHAR(50), user_address VARCHAR(255), event_date TEXT)',
              'CREATE TABLE IF NOT EXISTS table_user(user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_name VARCHAR(20), user_email VARCHAR(50), user_address VARCHAR(255), event_date TEXT)',
              [],
            );
          } else {
            console.log('already created table');
          }
        },
      );
    });
  }, []);

  // ===== insert data ======

  // const saveData = () => {
  //   db.transaction(txn => {
  //     txn.executeSql(
  //       'INSERT INTO table_user(user_name, user_email, user_address) VALUES(?,?,?)', // query for save data
  //       [name, email, address], // hook name into array
  //       (tex, res) => {
  //         // callback function for check response
  //         console.log(res);
  //         if (res.rowsAffected > 0) {
  //           Alert.alert('Data inserted successfully');
  //         } else {
  //           Alert.alert('Failed.....');
  //         }
  //       },
  //     );
  //   });
  // };

  const saveData = () => {
    // const currentDate = new Date();
    // const isoDateString = currentDate.toISOString();
  
    db.transaction(txn => {
      txn.executeSql(
          'INSERT INTO table_user(user_name, user_email, user_address, event_date) VALUES(?,?,?,?)',
          [name, email, address, localDateTime], // Include isoDateString here
          (tex, res) => {
              console.log(res);
              if (res.rowsAffected > 0) {
                  Alert.alert('Data inserted successfully');
                  getData();
              } else {
                  Alert.alert('Failed.....');
              }
          },
      );
  });
  };
  
  
  
  
  

  // ===== get data =====

  useEffect(() => {
    db.transaction(txn => {
      txn.executeSql('SELECT * FROM table_user', [], (tx, res) => {
        var temp = [];
        for (let i = 0; i < res.rows.length; ++i) {
          console.log(res.rows.item(i));
          temp.push(res.rows.item(i));
        }

        setUserList(temp);
      });
    });
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    db.transaction(txn => {
      txn.executeSql('SELECT * FROM table_user', [], (tx, res) => {
        var temp = [];
        for (let i = 0; i < res.rows.length; ++i) {
          console.log(res.rows.item(i));
          temp.push(res.rows.item(i));
        }

        setUserList(temp);
      });
    });
  };

  // ==== delete data =====

  const deleteData = id => {
    db.transaction(txn => {
      txn.executeSql(
        'DELETE FROM table_user where user_id=?',
        [id],
        (tx, res) => {
          if (res.rowsAffected > 0) {
            getData();

            Alert.alert('user delete successfully');
          } else {
            Alert.alert('Please insert a valid user Id');
          }
        },
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={text => setName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="address"
        value={address}
        onChangeText={text => setAddress(text)}
        // keyboardType="numeric"
      />
      <Button title="Submit" onPress={() => saveData()} />

      {/* show data into ui */}
      {userList.map(item => (
        <View
          style={{
            marginVertical: 10,
            backgroundColor: 'gray',
            padding: 10,
            elevation: 5,
            gap: 10,
            borderRadius:10,
          }}>
          <View>
            <Text style={{fontWeight:"700",fontSize:20,color:"#ffffff"}}>{item.user_name}</Text>
            <Text style={{fontWeight:"700",fontSize:15,color:"#ffffff"}}>{item.user_email}</Text>
            <Text style={{fontWeight:"700",fontSize:15,color:"#ffffff"}}>{item.user_address}</Text>
            <Text style={{fontWeight:"700",fontSize:15,color:"#ffffff"}}>{item.event_date}</Text>
          </View>
          <View>
            <Button
              title="DELETE"
              color={'red'}
              onPress={() => {
                deleteData(item.user_id);
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default App;


// ariyan arif
