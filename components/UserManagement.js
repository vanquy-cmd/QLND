import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { db } from '../src/firebase'; // Điều chỉnh nếu cần
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', age: '' });
  const [editingUser, setEditingUser] = useState(null);

  const isValidEmail = (email) => {
    const emailRegex = /^.{6,}@gmail\.com$/;
    return emailRegex.test(email);
  };

  // Hàm lấy danh sách người dùng
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCollection = collection(db, 'users');
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: data.id, ...data };
      });
      setUsers(userList);
    } 
    catch (err) {
      setError("Lỗi khi lấy dữ liệu người dùng!");
      console.error(err);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // Hàm thêm người dùng
  const handleAddUser = async () => {
    setLoading(true);
    setError(null);
    try {

        // Ràng buộc tên
        if (!newUser.name) {
            setError("Tên không được để trống!");
            return;
        }

        // Ràng buộc email
        if (!isValidEmail(newUser.email)) {
            setError("Email không hợp lệ!");
            return;
        }

        // Gán tuổi là 'none' nếu không ghi gì
        const age = newUser.age ? newUser.age : 'none';

        const existingUsers = await getDocs(collection(db, 'users'));
        const newId = existingUsers.docs.length + 1;

        await addDoc(collection(db, 'users'), { id: newId, name: newUser.name, email: newUser.email, age });

        setUsers([...users, { id: newId, name: newUser.name, email: newUser.email, age }]);
        setNewUser({ name: '', email: '', age: '' });
        Alert.alert("Thêm người dùng thành công!");
    } 
    catch (err) {
        setError("Lỗi khi thêm người dùng!");
        console.error(err);
    } 
    finally {
        setLoading(false);
    }
  };

  // Hàm cập nhật người dùng
  const handleUpdateUser = async () => {
    setLoading(true);
    setError(null);
    try {
        // Ràng buộc tên không được để trống
        if (!editingUser.name) {
            setError("Tên không được để trống!");
            return;
        }
    
        // Ràng buộc email
        if (!isValidEmail(editingUser.email)) {
            setError("Email không hợp lệ!");
            return;
        }
    
        // Gán tuổi là 'none' nếu không ghi gì
        const age = editingUser.age ? editingUser.age : 'none';

        const userQuery = query(collection(db, 'users'), where('id', '==', editingUser.id));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(userDoc.ref, { ...editingUser, age }); // Cập nhật document với tuổi đã gán
      
            setUsers(users.map(user => (user.id === editingUser.id ? { ...editingUser, age } : user)));
            setEditingUser(null);
            Alert.alert("Cập nhật người dùng thành công!");
        } 
        else {
            setError("Không tìm thấy người dùng để cập nhật!");
        }
    } 
    catch (err) {
      setError("Lỗi khi cập nhật người dùng!");
      console.error(err);
    } 
    finally {
      setLoading(false);
    }
  };
  
  // Hàm xóa người dùng
  const handleDeleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const userQuery = query(collection(db, 'users'), where('id', '==', id));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await deleteDoc(userDoc.ref);
        setUsers(users.filter(user => user.id !== id));
        Alert.alert("Xóa người dùng thành công!");
      } 
      else {
        setError("Không tìm thấy người dùng để xóa!");
      }
    } 
    catch (err) {
      setError("Lỗi khi xóa người dùng!");
      console.error(err);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Người dùng</Text>
      {loading && <Text>Đang tải dữ liệu...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        placeholder="Tên"
        value={editingUser ? editingUser.name : newUser.name}
        onChangeText={(text) => editingUser ? setEditingUser({ ...editingUser, name: text }) : setNewUser({ ...newUser, name: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={editingUser ? editingUser.email : newUser.email}
        onChangeText={(text) => editingUser ? setEditingUser({ ...editingUser, email: text }) : setNewUser({ ...newUser, email: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Tuổi"
        value={editingUser ? editingUser.age.toString() : newUser.age}
        onChangeText={(text) => editingUser ? setEditingUser({ ...editingUser, age: text }) : setNewUser({ ...newUser, age: text })}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button title={editingUser ? 'Cập nhật' : 'Thêm'} onPress={editingUser ? handleUpdateUser : handleAddUser} />
      
      <Text style={styles.userListTitle}>Danh sách Người dùng</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()} // Đảm bảo ID là chuỗi
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name} - {item.email} - {item.age}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Sửa" onPress={() => setEditingUser(item)} />
              <Button title="Xóa" onPress={() => handleDeleteUser(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  error: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  userListTitle: {
    fontSize: 18,
    marginVertical: 20,
  },
  userItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default UserManagement;