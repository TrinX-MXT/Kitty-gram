package ru.yandex.practicum.catsgram.model;

import java.time.Instant;


import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@EqualsAndHashCode(of = "email")
@Getter
@Setter
public class User {
    private Long id;
    private String username;
    private String email;
    private String  password;
    private Instant registrationDate;
}















