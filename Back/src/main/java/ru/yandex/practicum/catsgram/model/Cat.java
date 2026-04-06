package ru.yandex.practicum.catsgram.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Cat {
    private String color;
    private int age;

    @Override
    public String toString() {
        return "Cat{" +
                "color='" + color + '\'' +
                ", age=" + age +
                '}';
    }
}
