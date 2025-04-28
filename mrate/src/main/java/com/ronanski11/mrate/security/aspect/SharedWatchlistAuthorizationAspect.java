package com.ronanski11.mrate.security.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.ronanski11.mrate.model.User;
import com.ronanski11.mrate.repository.UserRepository;
import com.ronanski11.mrate.security.AuthenticationService;

@Aspect
@Component
public class SharedWatchlistAuthorizationAspect {
    
    @Autowired
    UserRepository uRepo;
    
    @Autowired
    private AuthenticationService auth;

    @Around("@annotation(RequiresWatchlistAccess) && args(watchlistId,..)")
    public Object checkWatchlistAccess(ProceedingJoinPoint joinPoint, String watchlistId) throws Throwable {
        User user = uRepo.findByUsername(auth.getUsername()).get();
        
        if (!user.getSharedWatchlists().contains(watchlistId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No access to this watchlist");
        }
        
        return joinPoint.proceed();
    }
}