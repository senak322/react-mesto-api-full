import { useEffect, useState, useCallback } from "react";
import Header from "./Header.js";
import Main from "./Main.js";
import Footer from "./Footer.js";
import ImagePopup from "./ImagePopup.js";
import { api } from "../utils/Api.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import DeletePopup from "./DeletePopup.js";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import Login from "./Login.js";
import Register from "./Register.js";
import ProtectedRoute from "./ProtectedRoute.js";
import InfoTooltip from "./InfoTooltip.js";
import { register, login, getContent, getCards } from "../utils/auth.js";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);
  const [isAuthOk, setIsAuthOk] = useState(true);
  const [deletedCard, setDeletedCard] = useState({});
  const [selectedCard, setSelectedCard] = useState({});
  const [isSelect, setIsSelect] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  const history = useHistory();
  const [loggedIn, setLoggedIn] = useState(false);

  const cbTokenCheck = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getContent(token)
        .then((res) => {
          if (res) {
            setLoggedIn(true);
            history.push("/");
            setUserEmail(res.data.email);
            setCurrentUser(res.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      getCards(token)
        .then((res) => {
          setCards(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [history]);

  function handleCardLike(card) {
    // ?????????? ??????????????????, ???????? ???? ?????? ???????? ???? ???????? ????????????????
    const isLiked = card.likes.some((i) => i === currentUser._id);

    // ???????????????????? ???????????? ?? API ?? ???????????????? ?????????????????????? ???????????? ????????????????
    api
      .changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((cards) =>
          cards.map((c) => (c._id === card._id ? newCard.data : c))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardDelete(card) {
    setIsLoading(true);
    api
      .deleteCard(card._id)
      .then((newCards) => {
        setCards((cards) => cards.filter((el) => el._id !== card._id));
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsSelect(false);
    setSelectedCard({});
    setIsDeletePopupOpen(false);
    setDeletedCard({});
    setIsInfoPopupOpen(false);
  }

  const isOpen =
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    isEditAvatarPopupOpen ||
    isDeletePopupOpen ||
    selectedCard.link ||
    isInfoPopupOpen;

  useEffect(() => {
    function closeByEscape(e) {
      if (e.key === "Escape") {
        closeAllPopups();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", closeByEscape);
      return () => {
        document.removeEventListener("keydown", closeByEscape);
      };
    }
  }, [isOpen]);

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsSelect(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }

  function handleUpdateUser(data) {
    setIsLoading(true);
    api
      .editInfo(data)
      .then((res) => {
        setCurrentUser(res.data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleUpdateAvatar(data) {
    setIsLoading(true);
    api
      .setAvatar(data)
      .then((res) => {
        setCurrentUser(res.data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleAddPlaceSubmit(card) {
    setIsLoading(true);
    api
      .addCard(card)
      .then((res) => {
        setCards([res.data, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleDeleteClick(card) {
    setIsDeletePopupOpen(!isDeletePopupOpen);
    setDeletedCard(card);
  }

  function handleLogout() {
    setLoggedIn(false);
    localStorage.removeItem("token");
  }

  function handleAuth(bool) {
    setIsInfoPopupOpen(!isInfoPopupOpen);
    setIsAuthOk(bool);
  }

  function handleRegister(email, password) {
    register(email, password)
      .then((res) => {
        if (res) {
          handleAuth(true);
          history.push("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        handleAuth(false);
      });
  }

  function handleLogin(email, password) {
    login(email, password)
      .then((res) => {
        if (res.jwt) {
          localStorage.setItem("token", res.jwt)
          setLoggedIn(true);
          history.push("/");
        }
      })
      .catch((err) => {
        console.log(err);
        handleAuth(false);
      });
  }

  const getInfo = useCallback(() => {
    if (loggedIn) {
      api
        .getImages()
        .then((res) => {
          setCards(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
      api
        .getProfileInfo()
        .then((res) => {
          setCurrentUser(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [loggedIn]);

  useEffect(() => {
    cbTokenCheck();
  }, [cbTokenCheck, loggedIn]);

  useEffect(() => {
    getInfo();
  }, [getInfo, loggedIn]);

  return (
    <div className="page">
      <Switch>
        <CurrentUserContext.Provider value={currentUser}>
          <ProtectedRoute
            path="/"
            loggedIn={loggedIn}
            children={
              <>
                <Header
                  link="/login"
                  headerText="??????????"
                  loggedIn={loggedIn}
                  onExit={handleLogout}
                  userEmail={userEmail}
                />
                <Main
                  cards={cards}
                  onCardLike={handleCardLike}
                  onCardDelete={handleDeleteClick}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  onCardClick={handleCardClick}
                />
                <Footer />
              </>
            }
          />
          <EditProfilePopup
            isLoading={isLoading}
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />
          <EditAvatarPopup
            isLoading={isLoading}
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />
          <AddPlacePopup
            isLoading={isLoading}
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
          />
          <DeletePopup
            isLoading={isLoading}
            isOpen={isDeletePopupOpen}
            onClose={closeAllPopups}
            onDelete={handleCardDelete}
            card={deletedCard}
          />
          <ImagePopup
            isSelect={isSelect}
            card={selectedCard}
            onClose={closeAllPopups}
          />

          <Route path="/register">
            <Header link="/login" headerText="??????????" />
            <Register onRegister={handleRegister} />
          </Route>
          <Route path="/login">
            <Header link="/register" headerText="??????????????????????" />
            <Login onLogin={handleLogin} />
          </Route>
          <InfoTooltip
            isOpen={isInfoPopupOpen}
            isOk={isAuthOk}
            onClose={closeAllPopups}
            message={
              isAuthOk
                ? "???? ?????????????? ????????????????????????????????????!"
                : `??????-???? ?????????? ???? ??????! ???????????????????? ?????? ??????.`
            }
          />
          <Route path="*">
            {loggedIn ? <Redirect to="/" /> : <Redirect to="/login" />}
          </Route>
        </CurrentUserContext.Provider>
      </Switch>
    </div>
  );
}

export default App;
