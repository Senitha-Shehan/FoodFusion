package backend.exception;

public class cookingPlanNotFoundException extends RuntimeException {
    public  cookingPlanNotFoundException (Long id) {
        super("could not find id"+ id);
    }
    public cookingPlanNotFoundException(String message){
        super(message);
    }
}
