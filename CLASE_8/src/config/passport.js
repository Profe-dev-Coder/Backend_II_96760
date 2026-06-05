import { Strategy as JwtStrategy , ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import { User } from '../models/user.model.js';


import { Strategy as GitHubStrategy} from 'passport-github2';

// las opts
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

//strategy jwt
passport.use(new JwtStrategy(opts, async (payload, done) =>{
    try {
        const user = await User.findById(payload.id);

        if(user){
            return done(null, user);
        }
        return done(null, false)

        
    } catch (error) {
        return done(error, false)
    }
})
)


// En la clase 7 completamos la configuración de GitHub Strategy
const githubOpts = {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/github/callback",
    scope: ['user:email'],
    allRawEmails: true 
};
//GitHub

passport.use(new GitHubStrategy(githubOpts, async (accessToken, refreshToken, profile, done) =>{

    console.log("GitHub Strategy - Profile:", profile);

    try {
        
        const email = profile.emails && profile.emails[0].value ? profile.emails[0].value : null;

        if(!email){
            return done(new Error("Email no proporcionado por GitHub"), null);
        }

        let user = await User.findOne({email});

        if(!user){
            user = await User.create({
                name: profile.displayName || profile.username,
                email: email,
                password: "oauth_user"
            });
        }

        return done(null, user);

    } catch (error) {
        return done(error, null);
    }

}))