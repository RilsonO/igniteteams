import React, { useState } from 'react';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Highlight } from '@components/Highlight';
import { Input } from '@components/Input';
import { useNavigation } from '@react-navigation/native';
import { Container, Content, Icon } from './styles';
import { groupCreate } from '@storage/group/groupCreate';
import { AppError } from '@utils/AppError';
import { Alert } from 'react-native';

export function NewGroup() {
  const navigation = useNavigation();
  const [group, setGroup] = useState('');

  async function handleNew() {
    try {
      if (group.trim().length === 0) {
        return Alert.alert('Novo grupo', 'Informe o nome da turma.');
      }

      await groupCreate(group);
      navigation.navigate('players', { group });
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Novo Grupo', error.message);
      } else {
        Alert.alert('Novo Grupo', 'Não foi possível criar um novo grupo.');
        console.log(error);
      }
    }
  }

  return (
    <Container>
      <Header showBackButton />

      <Content>
        <Icon />
        <Highlight
          title='Nova Turma'
          subtitle='crie a turma para adicionar as pessoas'
        />

        <Input
          placeholder='Nome da turma'
          value={group}
          onChangeText={setGroup}
        />

        <Button style={{ marginTop: 20 }} title='Criar' onPress={handleNew} />
      </Content>
    </Container>
  );
}
