import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Feedback() {

  const router = useRouter();

  function rateSession(score: number) {

    console.log("Avaliação:", score);

    router.push("/home");
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Como foi sua sessão?</Text>

      <View style={styles.row}>

        <TouchableOpacity
          style={styles.button}
          onPress={() => rateSession(1)}
        >
          <Text style={styles.text}>😞</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => rateSession(3)}
        >
          <Text style={styles.text}>😐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => rateSession(5)}
        >
          <Text style={styles.text}>🙂</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0f172a",
    justifyContent:"center",
    alignItems:"center"
  },

  title:{
    color:"white",
    fontSize:24,
    marginBottom:40
  },

  row:{
    flexDirection:"row"
  },

  button:{
    backgroundColor:"#1e293b",
    padding:20,
    margin:10,
    borderRadius:12
  },

  text:{
    fontSize:28
  }

});