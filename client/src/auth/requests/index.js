/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
    @author elvitigalalis
*/

const baseURL = "http://localhost:4000/auth";

async function request(path, method = "GET", body = null) {
  const url = baseURL + path;
  try {
    const options = {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      data: data,
    };
  } catch (e) {
    return { status: 500, data: { success: false, error: e.message } };
  }
}

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

export const getLoggedIn = () => request("/loggedIn", "GET");
export const loginUser = (email, password) => {
  return request("/login", "POST", {
    email: email,
    password: password,
  });
};
export const logoutUser = () => request("/logout", "GET");
export const registerUser = (
  username,
  email,
  password,
  passwordVerify,
  profilePicture
) => {
  return request("/register", "POST", {
    username: username,
    email: email,
    password: password,
    passwordVerify: passwordVerify,
    profilePicture: profilePicture
  });
};
const apis = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
};

export default apis;