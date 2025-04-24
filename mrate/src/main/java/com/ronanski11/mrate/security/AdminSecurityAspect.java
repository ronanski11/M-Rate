package com.ronanski11.mrate.security;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Aspect
@Component
public class AdminSecurityAspect {

    @Autowired
    private AuthenticationService auth;

    @Around("@within(com.ronanski11.mrate.security.RequireAdmin) || @annotation(com.ronanski11.mrate.security.RequireAdmin)")
    public Object checkAdminAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        if (!auth.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return joinPoint.proceed();
    }
}