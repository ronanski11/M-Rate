package com.ronanski11.mrate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication
@EnableAspectJAutoProxy
public class MrateApplication {

	public static void main(String[] args) {
		SpringApplication.run(MrateApplication.class, args);
	}

}
