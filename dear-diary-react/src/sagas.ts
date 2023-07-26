import { eventChannel } from "redux-saga";
import {
  all,
  call,
  put,
  take,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import {
  addCard,
  setCards,
  fetchCards,
} from "./components/DiaryComponents/cardSlice";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import db from "./firebase";

interface Cards {
  id: string;
  title: string;
  description: string;
  userName: string;
}

interface AddCardAction {
  type: typeof addCard.type;
  payload: Cards;
}

function* addCardSaga(action: AddCardAction): Generator<any, any, any> {
  try {
    const { title, description, userName } = action.payload;
    yield addDoc(collection(db, "cards"), {
      title,
      description,
      userName,
    });
  } catch (error) {
    console.log("Error adding card:", error);
  }
}

function createCardsChannel() {
  return eventChannel((emit) => {
    const unsubscribe = onSnapshot(collection(db, "cards"), (snapshot) => {
      const cards: Cards[] = [];
      snapshot.docs.forEach((doc) => {
        cards.push({ id: doc.id, ...doc.data() } as Cards);
      });
      emit(cards);
    });

    return () => {
      unsubscribe();
    };
  });
}

function* fetchCardsSaga(): Generator<any, any, any> {
  const channel = yield call(createCardsChannel);

  try {
    while (true) {
      const cards: Cards[] = yield take(channel);
      yield put(setCards(cards));
    }
  } catch (error) {
    console.log("Error fetching cards:", error);
  }
}

function* watchAddCard() {
  yield takeLatest(addCard.type, addCardSaga);
}

function* watchFetchCards() {
  yield takeEvery(fetchCards.type, fetchCardsSaga);
}

export default function* rootSaga() {
  yield all([watchFetchCards(), watchAddCard()]);
}