import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

export function setEntries(state, entries) {
  const list = List(entries);
  return state.set('entries', list)
              .set('initialEntries', list);
}

function getWinners(vote) {
  if (!vote) return [];
  const [one, two, three, four] = vote.get('pair');
  const oneVotes = vote.getIn(['tally', one], 0);
  const twoVotes = vote.getIn(['tally', two], 0);
  const threeVotes = vote.getIn(['tally', three], 0);
  const fourVotes = vote.getIn(['tally', four], 0);
  if(oneVotes > twoVotes && oneVotes > threeVotes && oneVotes > fourVotes)  return [one];
  else if (oneVotes < twoVotes && twoVotes > threeVotes && twoVotes > fourVotes)  return [two];
  else if (oneVotes < threeVotes && twoVotes < threeVotes && fourVotes < threeVotes)  return [three];
  else if (oneVotes < fourVotes && twoVotes < fourVotes && threeVotes < fourVotes) return [four];
  else return [one, two, three, four];
}

export function next(state, round = state.getIn(['vote', 'round'], 0)) {
  const entries = state.get('entries')
                       .concat(getWinners(state.get('vote')));
  if (entries.size === 1) {
    return state.remove('vote')
                .remove('entries')
                .set('winner', entries.first());
  } else {
    return state.merge({
      vote: Map({
        round: round + 1,
        pair: entries.take(4)
      }),
      entries: entries.skip(4)
    });
  }
}

export function restart(state) {
  const round = state.getIn(['vote', 'round'], 0);
  return next(
    state.set('entries', state.get('initialEntries'))
         .remove('vote')
         .remove('winner'),
    round
  );
}

function removePreviousVote(voteState, voter) { console.log('second');
  const previousVote = voteState.getIn(['votes', voter]);
  console.log(previousVote);
  if (previousVote) {
    return voteState/*.updateIn(['tally', previousVote], t => t - 1)
                    .removeIn(['votes', voter])*/;
  } else {
    return voteState;
  }
}

function addVote(voteState, entry, voter) {
  console.log(voteState);
  console.log(entry);
  console.log(voter);
  console.log(voteState.get('pair').includes(entry));
  if (voteState.get('pair').includes(entry)) {
    return voteState.updateIn(['tally', entry], 0, t => t + 1)
                    .setIn(['votes', voter], entry);
  } else {
    return voteState;
  }
}

export function vote(voteState, entry, voter) { console.log('first');
  return addVote(
    removePreviousVote(voteState, voter),
    entry,
    voter
  );
}
