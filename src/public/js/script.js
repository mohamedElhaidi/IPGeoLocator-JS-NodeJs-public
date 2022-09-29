window.addEventListener("load", function () {
  // // profile
  // const changeMenuHighlight = (id) => {
  //   const menu = document.querySelector("#profileSideMenu");
  //   if (!id) {
  //     menu.children[0].classList.add("active");
  //     return;
  //   }
  //   [...menu.children].forEach((li) => {
  //     const a = li.querySelector("a");
  //     if (a.id === id) li.classList.add("active");
  //     else li.classList.remove("active");
  //   });
  // };
  // // checks hash and do something with it
  // function profileHashChecker() {
  //   // if the web page is not profile page then skip
  //   if (!window.location.pathname in ["/user/profile", "/user/dashboard"])
  //     return;
  //   // get id from hashtag
  //   const hash = document.location.hash.split("#");
  //   // fetch all profile sections or pages
  //   const profilePages = document.getElementsByClassName("profile-page");
  //   if (hash.length > 1) {
  //     [...profilePages].forEach((element) => {
  //       if (element.id === hash[1] + "-page") element.style.display = "initial";
  //       else element.style.display = "none";
  //     });
  //     changeMenuHighlight(hash[1]);
  //     return;
  //   }
  //   if (profilePages.length > 1) {
  //     [...profilePages].forEach((element, index) => {
  //       if (index === 0) element.style.display = "initial";
  //       else element.style.display = "none";
  //     });
  //   }
  //   changeMenuHighlight();
  // }
  // // when user clicks on a hash link
  // window.addEventListener("hashchange", () => {
  //   // profile
  //   profileHashChecker();
  // });
  // // init
  // profileHashChecker();
});
