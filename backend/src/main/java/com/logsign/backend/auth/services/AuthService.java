package com.logsign.backend.auth.services;

import com.logsign.backend.auth.payload.UserDto;

public interface AuthService {
    UserDto registerUser(UserDto userDto);


    //login user

}
