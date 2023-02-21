import { Button } from '@components/Button';
import { ButtonIcon } from '@components/ButtonIcon';
import { Filter } from '@components/Filter';
import { Header } from '@components/Header';
import { Highlight } from '@components/Highlight';
import { Input } from '@components/Input';
import { ListEmpty } from '@components/ListEmpty';
import { PlayerCard } from '@components/PlayerCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { playerAddByGroup } from '@storage/player/playerAddByGroup';
import { playersGetByGroup } from '@storage/player/playersGetByGroup';
import { AppError } from '@utils/AppError';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, TextInput } from 'react-native';
import { Container, Form, HeaderList, NumberOfPlayers } from './styles';
import { playersGetByGroupAndTeam } from '@storage/player/playersGetByGroupAndTeam';
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO';
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup';
import { groupRemoveByName } from '@storage/group/groupRemoveByName';
import { Loading } from '@components/Loading';

type RouteParams = {
  group: string;
};

export function Players() {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params as RouteParams;
  const newPlayerNameInputRef = useRef<TextInput>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState('TIME A');
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  async function handleAddPlayer() {
    if (newPlayerName.trim().length === 0) {
      return Alert.alert(
        'Nova pessoa',
        'Informe o nome da pessoa para adicionar.'
      );
    }

    const newPlayer = {
      name: newPlayerName,
      team,
    };

    try {
      await playerAddByGroup(newPlayer, group);
      newPlayerNameInputRef.current?.blur();
      setNewPlayerName('');
      fetchPlayersByTeam();
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Nova pessoa', error.message);
      } else {
        console.log(error);
        Alert.alert('Nova pessoa', 'Não foi possível adicionar');
      }
    }
  }

  async function fetchPlayersByTeam() {
    try {
      setIsLoading(true);

      const playersByTeam = await playersGetByGroupAndTeam(group, team);

      setPlayers(playersByTeam);
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Pessoas',
        'Não foi possivel carregar as pessoas do time selecionado.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePlayerRemove(playerName: string) {
    try {
      const playersByTeam = await playerRemoveByGroup(playerName, group);
      fetchPlayersByTeam();
    } catch (error) {
      console.log(error);
      Alert.alert('Remover Pessoa', 'Não foi possivel remover essa pessoa.');
    }
  }

  async function groupRemove() {
    try {
      await groupRemoveByName(group);
      navigation.navigate('groups');
    } catch (error) {
      console.log(error);
      Alert.alert('Remover grupo', 'Não foi possivel remover o grupo.');
    }
  }

  async function handleGroupRemove() {
    Alert.alert('Remover', 'Deseja remover a turma?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => groupRemove() },
    ]);
  }

  useEffect(() => {
    fetchPlayersByTeam();
  }, [team]);

  return (
    <Container>
      <Header showBackButton />
      <Highlight title={group} subtitle='Adicione a galera e separe os times' />

      <Form>
        <Input
          inputRef={newPlayerNameInputRef}
          onChangeText={setNewPlayerName}
          value={newPlayerName}
          placeholder='Nome da pessoa'
          autoCorrect={false}
          onSubmitEditing={handleAddPlayer}
          returnKeyType='done'
        />

        <ButtonIcon icon='add' onPress={handleAddPlayer} />
      </Form>

      <HeaderList>
        <FlatList
          data={['TIME A', 'TIME B']}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Filter
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
        />
        <NumberOfPlayers>{players.length}</NumberOfPlayers>
      </HeaderList>

      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <PlayerCard
              name={item.name}
              onRemove={() => handlePlayerRemove(item.name)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmpty message='Não há pessoas nesse time' />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingBottom: 100 },
            players.length === 0 && { flex: 1 },
          ]}
        />
      )}
      <Button
        title='Remover Turma'
        type='SECONDARY'
        onPress={handleGroupRemove}
      />
    </Container>
  );
}
