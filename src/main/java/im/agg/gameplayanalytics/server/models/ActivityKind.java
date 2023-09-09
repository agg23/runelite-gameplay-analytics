package im.agg.gameplayanalytics.server.models;

import lombok.Getter;

@Getter
public enum ActivityKind {
    Login(0),
    Logout(1),
    Active(2),
    Idle(3);

    private final int state;

    ActivityKind(int state) {
        this.state = state;
    }

//    public Integer toInt() {
//        return switch (this) {
//            case Login -> 0;
//            case Logout -> 1;
//            case Active -> 2;
//            case Idle -> 3;
//        };
//    }
//
//    public static ActivityKind fromInt(Integer value) {
//        return switch (value) {
//            case 0 -> Login;
//            case 1 -> Logout;
//            case 2 -> Active;
//            case 3 -> Idle;
//            default -> throw new RuntimeException("Invalid ActivityKind value");
//        };
//    }
}
