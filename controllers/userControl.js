import UserSchema from "../models/userDB.js";
import PostSchema from "../models/postDB.js";

// getUserPosts - GET
export const getUserPost = async (req, res) => {
  try {
    const userPosts = await UserSchema.findOne({ _id: req.params.username })
      .select("username profilePicture followers following")
      .populate("following", "_id username profilePicture followers following")
      .populate("followers", "_id username profilePicture followers following")
      .then((user) => {
        PostSchema.find({ creator: req.params.username })
          .populate(
            "creator",
            "_id username profilePicture followers following"
          )
          .populate("comments.creator", "_id username profilePicture")
          .populate("likers", "_id username profilePicture")
          .populate(
            "following",
            "_id username profilePicture followers following"
          )
          .populate(
            "followers",
            "_id username profilePicture followers following"
          )
          .sort({ createdAt: -1 })
          .exec((err, posts) => {
            if (err) {
              return res.status(422).json({ error: err });
            }
            res.json({ user, posts });
          });
      })
      .catch((err) => {
        return res.status(404).json({ error: "User not found" });
        // console.log(err);
      });
    // if (!userPosts) throw Error('No userPosts!');
    // res.status(200).json(userPosts);
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

// updateAvatar - PUT
// export const updateAvatar = async(req, res) => {
//     try {
//         const posts = await UserSchema.findByIdAndUpdate(req.user._id, {})
//         if (!posts) throw Error('No posts!');
//         res.status(200).json(posts);
//     } catch (error) {
//         res.status(400).json({ msg: error });
//     }
// }

// Follow other users - PUT
export const followOthers = (req, res) => {
  UserSchema.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      UserSchema.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        {
          new: true,
        }
      )
        .select("username profilePicture followers following email name")
        .populate(
          "following",
          "_id username profilePicture followers following"
        )
        .populate(
          "followers",
          "_id username profilePicture followers following"
        )
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
};

// unFollow other users - PUT
export const unFollowOthers = (req, res) => {
  UserSchema.findByIdAndUpdate(
    req.body.unFollowId,
    {
      $pull: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      UserSchema.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unFollowId },
        },
        {
          new: true,
        }
      )
        .select("username profilePicture followers following email name")
        .populate(
          "following",
          "_id username profilePicture followers following"
        )
        .populate(
          "followers",
          "_id username profilePicture followers following"
        )
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
};

// Update profile picture
export const updateAvatar = (req, res) => {
  UserSchema.findByIdAndUpdate(
    req.user._id,
    {
      $set: { profilePicture: req.body.avatar },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res
          .status(422)
          .json({ error: "Không thể cập nhật ảnh đại diện" });
      }
      res.json(result);
    }
  )
    .select("username profilePicture followers following email name")
    .populate("following", "_id username profilePicture followers following")
    .populate("followers", "_id username profilePicture followers following");
  // .then(result => {
  //     res.json(result);
  // }).catch(err => {
  //     return res.status(422).json({ error: err });
  // })
};
export const updateInfo = (req, res) => {
  const { name, email, username } = req.body;
  UserSchema.findOneAndUpdate(
    { _id: req.user._id },
    {
      email: email,
      name: name,
      username: username,
    },
    { new: true },
    (err, result) => {
      if (err) {
        res.status(500).json({ msg: error });
      }
      res.status(200).json(result);
    }
  )
    .select("username profilePicture followers following email name")
    .populate("following", "_id username profilePicture followers following")
    .populate("followers", "_id username profilePicture followers following");
};

// Search user
export const searchUser = (req, res) => {
  let userRegex = new RegExp(req.body.query);
  UserSchema.find({
    username: { $regex: userRegex, $options: "im" },
  })
    .select("_id username ")
    .populate("following", "_id username profilePicture followers following")
    .populate("followers", "_id username profilePicture followers following")
    .then((user) => {
      res.json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
};
