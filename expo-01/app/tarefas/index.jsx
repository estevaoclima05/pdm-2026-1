import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adicionarTarefa, getTarefas, atualizarTarefa, deletarTarefa } from "@/back4app";

export default function TarefasPage() {
  const queryClient = useQueryClient();
  const [descricao, setDescricao] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["tarefas"],
    queryFn: getTarefas,
  });

  const addMutation = useMutation({
    mutationFn: adicionarTarefa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      setDescricao("");
    },
    onError: () => Alert.alert("Erro", "Não foi possível adicionar a tarefa."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, concluida }) => atualizarTarefa(id, { concluida }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarefas"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletarTarefa(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarefas"] }),
    onError: () => Alert.alert("Erro", "Não foi possível excluir a tarefa."),
  });

  async function handleAdicionarTarefaPress() {
    if (descricao.trim() === "") {
      Alert.alert("Descrição inválida", "Preencha a descrição da tarefa");
      return;
    }
    addMutation.mutate({ descricao, concluida: false });
  }

  const isLoading = isFetching || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="O que precisa ser feito?"
        value={descricao}
        onChangeText={setDescricao}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.addButton, addMutation.isPending && styles.disabledButton]}
        onPress={handleAdicionarTarefaPress}
        disabled={addMutation.isPending}
      >
        <Text style={styles.addButtonText}>
          {addMutation.isPending ? "ADICIONANDO..." : "ADICIONAR TAREFA"}
        </Text>
      </TouchableOpacity>

      <View style={styles.hr} />

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {data?.map((t) => (
          <View key={t.objectId} style={styles.taskCard}>
            <Text
              style={[
                styles.taskText,
                t.concluida && styles.strikethroughText,
              ]}
            >
              {t.descricao}
            </Text>

            <View style={styles.actions}>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={t.concluida ? "#007AFF" : "#f4f3f4"}
                value={t.concluida}
                onValueChange={(value) =>
                  updateMutation.mutate({ id: t.objectId, concluida: value })
                }
              />
              
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteMutation.mutate(t.objectId)}
              >
                <Text style={styles.deleteBtnText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    alignItems: "center",
  },
  loader: {
    position: 'absolute',
    top: 10,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: "100%",
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  disabledButton: {
    backgroundColor: "#A7C7E7",
  },
  hr: {
    height: 1,
    backgroundColor: "#ddd",
    width: "100%",
    marginVertical: 20,
  },
  listContainer: {
    width: "100%",
  },
  taskCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  strikethroughText: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteBtn: {
    backgroundColor: "#FF3B30",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});