import { Strategy as JwtStrategy , ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import { User } from '../models/User.js';


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
    callbackURL: process.env.GITHUB_CALLBACK_URL
};
//GitHub

passport.use(new GitHubStrategy(githubOpts, async (accessToken, refreshToken, profile, done) =>{
    const user = await User.findOne({githubId: profile.id});

    if(!user){
       
        const newUser = await User.create({
            githubId: profile.id,
            username: profile.username,
            email: profile.emails[0].value,
            password: null
        });
    }


    return done(null, newUser);

}))